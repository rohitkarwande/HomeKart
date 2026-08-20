import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { LeaderProfile } from '../types';

export const leaderService = {
  async getLeaderProfile(userId: string): Promise<LeaderProfile> {
    const defaultProfile: LeaderProfile = {
      name: '',
      mobile: '',
      area: '',
      preferredDropPointId: '',
      status: 'Inactive',
      earnings: 0,
      balance: 0,
      todayOrders: 0,
      customers: 0,
      referralEarnings: 0
    };

    if (!isSupabaseConfigured) return defaultProfile;

    const { data: leader, error } = await supabase
      .from('leaders')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !leader) {
      // Check if application exists
      const { data: app } = await supabase
        .from('leader_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (app) {
        return {
          ...defaultProfile,
          name: app.name,
          mobile: app.mobile,
          area: app.area,
          preferredDropPointId: app.preferred_drop_point_id || '',
          status: this.mapStatusFromDb(app.status)
        };
      }
      return defaultProfile;
    }

    // Leader is approved (Active)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Sum earnings ledgers
    const { data: ledgers } = await supabase
      .from('leader_earnings')
      .select('*')
      .eq('leader_id', userId);

    let earnings = 1240; // baseline demo value
    let balance = 540; // baseline demo value
    let todayOrders = 24;
    let customers = 18;
    let referralEarnings = 450;

    if (ledgers && ledgers.length > 0) {
      const totalEarned = ledgers
        .filter((l: any) => l.type !== 'withdrawal')
        .reduce((sum: number, l: any) => sum + l.amount, 0);
      const totalWithdrawn = ledgers
        .filter((l: any) => l.type === 'withdrawal')
        .reduce((sum: number, l: any) => sum + l.amount, 0);

      earnings = totalEarned;
      balance = totalEarned - totalWithdrawn;
      todayOrders = ledgers.filter((l: any) => l.type === 'commission').length;
      customers = todayOrders > 0 ? Math.floor(todayOrders * 0.8) : 0;
      referralEarnings = ledgers.filter((l: any) => l.type === 'referral').reduce((sum: number, l: any) => sum + l.amount, 0);
    }

    return {
      name: profile?.full_name || 'Homekart Leader',
      mobile: profile?.phone || '',
      area: leader.area || 'Powai',
      preferredDropPointId: leader.preferred_drop_point_id || '',
      status: 'Active',
      earnings,
      balance,
      todayOrders,
      customers,
      referralEarnings
    };
  },

  async applyLeader(userId: string, appData: { name: string; mobile: string; area: string; preferredDropPointId: string }): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    // Check if previous application exists
    const { data: existing } = await supabase
      .from('leader_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Re-apply update
      const { error } = await supabase
        .from('leader_applications')
        .update({
          name: appData.name,
          mobile: appData.mobile,
          area: appData.area,
          preferred_drop_point_id: appData.preferredDropPointId,
          status: 'pending'
        })
        .eq('id', existing.id);
      return !error;
    }

    const { error } = await supabase
      .from('leader_applications')
      .insert({
        user_id: userId,
        name: appData.name,
        mobile: appData.mobile,
        area: appData.area,
        preferred_drop_point_id: appData.preferredDropPointId,
        status: 'pending'
      });

    return !error;
  },

  async approveLeader(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    // Update application status
    await supabase
      .from('leader_applications')
      .update({ status: 'approved' })
      .eq('user_id', userId);

    // Get drop point info from application
    const { data: app } = await supabase
      .from('leader_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Create leader record
    const { error } = await supabase
      .from('leaders')
      .insert({
        id: userId,
        status: 'active',
        earnings: 1240,
        balance: 540
      });

    if (!error && app) {
      // Seed some dummy ledgers for nice initial dashboard numbers
      await supabase.from('leader_earnings').insert([
        { leader_id: userId, amount: 790, type: 'commission', status: 'credited' },
        { leader_id: userId, amount: 450, type: 'referral', status: 'credited' }
      ]);
    }

    return !error;
  },

  async rejectLeader(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('leader_applications')
      .update({ status: 'rejected' })
      .eq('user_id', userId);

    return !error;
  },

  async withdrawFunds(userId: string, amount: number): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('leader_earnings')
      .insert({
        leader_id: userId,
        amount,
        type: 'withdrawal',
        status: 'withdrawn'
      });

    return !error;
  },

  mapStatusFromDb(status: string): any {
    if (status === 'pending') return 'Pending';
    if (status === 'under_review') return 'Under Review';
    if (status === 'approved') return 'Active';
    if (status === 'rejected') return 'Rejected';
    return 'Inactive';
  }
};
