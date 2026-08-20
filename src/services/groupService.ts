import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Group, GroupStatusType } from '../types';

export const groupService = {
  async getGroups(): Promise<Group[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('groups')
      .select('*, products(*), drop_points(*), group_members(*, profiles(*))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error.message);
      return [];
    }

    return data.map((g: any) => {
      const memberNames = g.group_members?.map((m: any) => m.profiles?.full_name || 'Community Member') || [];
      return {
        id: g.id,
        productId: g.product_id,
        productName: g.products?.name || 'Homekart Product',
        productImage: g.products?.image_url || '',
        groupPrice: g.group_price,
        originalPrice: g.products?.original_price || 0,
        savings: (g.products?.original_price || 0) - g.group_price,
        currentMembers: g.group_members?.length || 0,
        targetMembers: g.target_members,
        memberNames,
        status: this.mapStatusFromDb(g.status),
        deadline: g.expires_at,
        dropPointId: g.drop_point_id,
        dropPointName: g.drop_points?.name || 'Powai Mall'
      };
    });
  },

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    // Check if user is already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      console.warn('User already joined this group.');
      return true;
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        quantity: 1
      });

    if (error) {
      console.error('Error joining group:', error.message);
      return false;
    }

    // Refresh status based on member count
    await this.updateGroupStatus(groupId);
    return true;
  },

  async createGroup(productId: string, creatorId: string, dropPointId: string, groupPrice: number): Promise<string | null> {
    if (!isSupabaseConfigured) return `grp-${Date.now()}`;

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('groups')
      .insert({
        product_id: productId,
        creator_id: creatorId,
        group_price: groupPrice,
        target_members: 5,
        status: 'open',
        expires_at: expiresAt,
        drop_point_id: dropPointId
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating group:', error?.message);
      return null;
    }

    // Auto add creator to the group
    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: creatorId,
      quantity: 1
    });

    return data.id;
  },

  async updateGroupStatus(groupId: string): Promise<void> {
    const { data: members } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId);

    const count = members ? members.length : 0;
    let newStatus = 'open';

    if (count >= 5) {
      newStatus = 'confirmed';
    } else if (count === 4) {
      newStatus = 'almost_full';
    } else if (count > 1) {
      newStatus = 'joining';
    }

    await supabase
      .from('groups')
      .update({ status: newStatus })
      .eq('id', groupId);
  },

  mapStatusFromDb(status: string): GroupStatusType {
    if (status === 'open') return 'Open';
    if (status === 'joining') return 'Joining';
    if (status === 'almost_full') return 'Almost Full';
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'supplier_confirmed') return 'Supplier Confirmed';
    if (status === 'ready_for_pickup') return 'Ready for Pickup';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'refunded') return 'Refunded';
    return 'Open';
  },

  mapStatusToDb(status: GroupStatusType | string): string {
    if (status === 'Open') return 'open';
    if (status === 'Joining') return 'joining';
    if (status === 'Almost Full') return 'almost_full';
    if (status === 'Confirmed') return 'confirmed';
    if (status === 'Supplier Confirmed') return 'supplier_confirmed';
    if (status === 'Ready for Pickup') return 'ready_for_pickup';
    if (status === 'Completed') return 'completed';
    if (status === 'Cancelled') return 'cancelled';
    if (status === 'Refunded' || status === 'Refund Initiated') return 'refunded';
    return 'open';
  }
};
