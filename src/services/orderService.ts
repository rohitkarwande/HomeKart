import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Order, DropPoint } from '../types';

export const orderService = {
  async getOrders(userId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), drop_points(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
      return [];
    }

    return data.map((o: any) => {
      const dropPoint: DropPoint = {
        id: o.drop_points?.id || '',
        name: o.drop_points?.name || '',
        area: o.drop_points?.area || '',
        distance: 'Local Point',
        address: o.drop_points?.address || '',
        phone: o.drop_points?.phone || ''
      };

      const items = o.order_items.map((oi: any) => ({
        productId: oi.product_id,
        productName: oi.products?.name || 'Homekart Product',
        productImage: oi.products?.image_url || '',
        quantity: oi.quantity,
        originalPrice: oi.products?.original_price || oi.unit_price,
        groupPrice: oi.unit_price,
        isGroupBuy: !!o.group_id
      }));

      // Timeline calculation
      const timeline = [
        { title: 'ORDER PLACED', date: new Date(o.created_at).toLocaleDateString(), completed: true },
        { title: 'PAYMENT CONFIRMED', date: new Date(o.created_at).toLocaleDateString(), completed: o.payment_status === 'successful' },
        { title: 'GROUP CONFIRMED', date: 'Pending', completed: ['group_confirmed', 'supplier_confirmed', 'ready_for_pickup', 'picked_up', 'completed'].includes(o.status) },
        { title: 'SUPPLIER CONFIRMED', date: 'Pending', completed: ['supplier_confirmed', 'ready_for_pickup', 'picked_up', 'completed'].includes(o.status) },
        { title: 'READY FOR PICKUP', date: 'Pending', completed: ['ready_for_pickup', 'picked_up', 'completed'].includes(o.status) },
        { title: 'PICKED UP', date: 'Pending', completed: ['picked_up', 'completed'].includes(o.status) }
      ];

      if (o.status === 'cancelled' || o.payment_status === 'refund_initiated' || o.payment_status === 'refunded') {
        return {
          id: o.id,
          items,
          subtotal: o.subtotal,
          savings: o.group_savings,
          total: o.total_amount,
          paymentStatus: this.mapPaymentStatus(o.payment_status),
          groupStatus: 'Cancelled',
          dropPoint,
          pickupStatus: 'Pending',
          date: o.created_at,
          groupId: o.group_id || undefined,
          timeline: [
            { title: 'GROUP CANCELLED', date: 'Just now', completed: true },
            { title: 'REFUND INITIATED', date: 'Just now', completed: true },
            { title: 'REFUND COMPLETED', date: o.payment_status === 'refunded' ? 'Just now' : 'Pending', completed: o.payment_status === 'refunded' }
          ]
        };
      }

      return {
        id: o.id,
        items,
        subtotal: o.subtotal,
        savings: o.group_savings,
        total: o.total_amount,
        paymentStatus: this.mapPaymentStatus(o.payment_status),
        groupStatus: this.mapGroupStatus(o.status),
        dropPoint,
        pickupStatus: o.pickup_status === 'picked_up' ? 'Picked Up' : (o.pickup_status === 'ready_for_pickup' ? 'Ready for Pickup' : 'Pending'),
        date: o.created_at,
        groupId: o.group_id || undefined,
        timeline
      };
    });
  },

  async createOrder(
    userId: string,
    cartItems: any[],
    dropPoint: DropPoint,
    paymentMethod: string,
    subtotal: number,
    savings: number,
    total: number,
    groupId?: string,
    initialStatus: string = 'pending'
  ): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;

    const orderCode = `HK${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: userId,
        group_id: groupId || null,
        drop_point_id: dropPoint.id,
        status: initialStatus,
        payment_status: paymentMethod === 'COD' ? 'pending' : 'successful',
        subtotal,
        group_savings: savings,
        total_amount: total
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order in database:', orderError?.message);
      return null;
    }

    // Query group count for dynamic price calculation
    let currentMembers = 1;
    let targetMembers = 5;
    if (groupId) {
      const { data: grp } = await supabase
        .from('groups')
        .select('*, group_members(id)')
        .eq('id', groupId)
        .maybeSingle();
      if (grp) {
        currentMembers = grp.group_members?.length || 1;
        targetMembers = grp.target_members || 5;
      }
    }

    // Insert order items
    const orderItemsToInsert = cartItems.map(item => {
      const isGrp = item.isGroupBuy;
      const originalPrice = item.product.originalPrice;
      const groupPrice = item.product.groupPrice;
      
      let unitPrice = originalPrice;
      if (isGrp) {
        const maxDiscount = originalPrice - groupPrice;
        const discountRatio = Math.min(1, currentMembers / (targetMembers || 5));
        const dynamicDiscount = Math.round(maxDiscount * discountRatio);
        unitPrice = originalPrice - dynamicDiscount;
      }

      return {
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError.message);
      return null;
    }

    // Insert Payment details
    await supabase.from('payments').insert({
      order_id: order.id,
      payment_method: paymentMethod,
      amount: total,
      status: paymentMethod === 'COD' ? 'pending' : 'successful',
      transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}`
    });

    return {
      id: order.id,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        quantity: item.quantity,
        originalPrice: item.product.originalPrice,
        groupPrice: item.product.groupPrice,
        isGroupBuy: item.isGroupBuy
      })),
      subtotal,
      savings,
      total,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Successful',
      groupStatus: groupId ? 'Joining' : 'N/A',
      dropPoint,
      pickupStatus: 'Pending',
      date: order.created_at,
      groupId: groupId || undefined,
      timeline: [
        { title: 'ORDER PLACED', date: 'Just now', completed: true },
        { title: 'PAYMENT CONFIRMED', date: 'Just now', completed: paymentMethod !== 'COD' },
        { title: 'GROUP CONFIRMED', date: 'Pending', completed: false },
        { title: 'SUPPLIER CONFIRMED', date: 'Pending', completed: false },
        { title: 'READY FOR PICKUP', date: 'Pending', completed: false },
        { title: 'PICKED UP', date: 'Pending', completed: false }
      ]
    };
  },

  async cancelOrder(orderId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'refund_initiated'
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error cancelling order:', error.message);
      return false;
    }

    // Simulate refund completing 5 seconds later
    setTimeout(async () => {
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('id', orderId);
    }, 5000);

    return true;
  },

  async completeOrder(orderId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        pickup_status: 'picked_up'
      })
      .eq('id', orderId);

    return !error;
  },

  mapPaymentStatus(status: string): any {
    if (status === 'pending') return 'Pending';
    if (status === 'processing') return 'Processing';
    if (status === 'successful') return 'Successful';
    if (status === 'failed') return 'Failed';
    if (status === 'refund_initiated') return 'Refund Initiated';
    if (status === 'refunded') return 'Refunded';
    return 'Pending';
  },

  mapGroupStatus(status: string): any {
    if (status === 'pending') return 'Joining';
    if (status === 'group_pending') return 'Joining';
    if (status === 'group_confirmed') return 'Confirmed';
    if (status === 'supplier_confirmed') return 'Supplier Confirmed';
    if (status === 'ready_for_pickup') return 'Ready for Pickup';
    if (status === 'completed' || status === 'picked_up') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'refunded') return 'Refunded';
    return 'N/A';
  }
};
