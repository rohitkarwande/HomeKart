import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Product } from '../types';

export interface DBGetCartItem {
  product: Product;
  quantity: number;
  isGroupBuy: boolean;
  groupId?: string;
}

export const cartService = {
  async getOrCreateCartId(userId: string): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const { data: existing } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating cart:', createError.message);
      return null;
    }

    return newCart.id;
  },

  async getCart(userId: string): Promise<DBGetCartItem[]> {
    if (!isSupabaseConfigured) return [];

    const cartId = await this.getOrCreateCartId(userId);
    if (!cartId) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*, categories(name))')
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error fetching cart items:', error.message);
      return [];
    }

    return data.map((item: any) => ({
      product: {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description || '',
        category: item.products.categories?.name || 'Uncategorized',
        originalPrice: item.products.original_price,
        groupPrice: item.products.group_price,
        imageUrl: item.products.image_url || '',
        rating: 4.5,
        reviewsCount: 12,
        specifications: {},
        availability: item.products.stock > 0 ? 'in-stock' : 'out-of-stock'
      },
      quantity: item.quantity,
      isGroupBuy: item.is_group_buy,
      groupId: item.group_id || undefined
    }));
  },

  async addToCart(userId: string, productId: string, quantity: number, isGroupBuy: boolean, groupId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const cartId = await this.getOrCreateCartId(userId);
    if (!cartId) return false;

    // Check if the item already exists in the cart with the same settings
    const query = supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('is_group_buy', isGroupBuy);
    
    const finalQuery = groupId ? query.eq('group_id', groupId) : query.is('group_id', null);
    
    const { data: existing } = await finalQuery.maybeSingle();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      return !error;
    } else {
      // Insert item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
          is_group_buy: isGroupBuy,
          group_id: groupId || null
        });
      return !error;
    }
  },

  async removeFromCart(userId: string, productId: string, isGroupBuy: boolean, groupId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const cartId = await this.getOrCreateCartId(userId);
    if (!cartId) return false;

    const query = supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('is_group_buy', isGroupBuy);

    const finalQuery = groupId ? query.eq('group_id', groupId) : query.is('group_id', null);

    const { error } = await finalQuery;
    return !error;
  },

  async updateQuantity(userId: string, productId: string, isGroupBuy: boolean, groupId: string | undefined, quantity: number): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const cartId = await this.getOrCreateCartId(userId);
    if (!cartId) return false;

    const query = supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('is_group_buy', isGroupBuy);

    const finalQuery = groupId ? query.eq('group_id', groupId) : query.is('group_id', null);

    const { error } = await finalQuery;
    return !error;
  },

  async clearCart(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const cartId = await this.getOrCreateCartId(userId);
    if (!cartId) return false;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    return !error;
  }
};
