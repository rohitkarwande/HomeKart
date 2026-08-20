import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile } from '../types';

export const authService = {
  async login(phone: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Attempt Supabase OTP
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });

    if (error) {
      console.error('Supabase phone auth signInWithOtp error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  },

  async verifyOtp(phone: string, otp: string): Promise<{ user: any; profile: UserProfile | null; error: string | null }> {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    if (!isSupabaseConfigured) {
      // Mock session
      const mockUser = { id: 'mock-user-uuid', phone: formattedPhone };
      const mockProfile: UserProfile = {
        name: 'Divya Karwande',
        mobile: phone,
        referralCode: 'DIVYA840',
        referralEarnings: 450,
        referralsCount: 3,
        referralHistory: [
          { name: 'Rohit Sharma', date: '2026-08-10', amount: 150 },
          { name: 'Amit Kumar', date: '2026-08-12', amount: 150 }
        ]
      };
      return { user: mockUser, profile: mockProfile, error: null };
    }

    // Try Supabase verification
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms'
    });

    if (error) {
      console.error('Supabase verifyOtp failed:', error.message);
      return { user: null, profile: null, error: error.message };
    }

    const user = data.user;
    const profile = user ? await this.getProfile(user.id, phone) : null;
    return { user, profile, error: null };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async getProfile(userId: string, fallbackPhone: string): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      name: 'Homekart Customer',
      mobile: fallbackPhone,
      referralCode: `HK${userId.slice(0, 5).toUpperCase()}`,
      referralEarnings: 0,
      referralsCount: 0,
      referralHistory: []
    };

    if (!isSupabaseConfigured) {
      return defaultProfile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('Profile not found in database, creating standard record:', error?.message);
      
      // Auto-create profile record in database if authenticated
      const { data: insertData } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: 'Homekart Customer',
          phone: fallbackPhone
        })
        .select()
        .single();
        
      if (insertData) {
        return {
          name: insertData.full_name,
          mobile: insertData.phone,
          referralCode: `HK${userId.slice(0, 5).toUpperCase()}`,
          referralEarnings: 0,
          referralsCount: 0,
          referralHistory: []
        };
      }
      return defaultProfile;
    }

    // Load referral metrics
    const { data: refData } = await supabase
      .from('referrals')
      .select('*, profiles!referrals_referred_user_id_fkey(full_name)')
      .eq('referrer_id', userId);

    const referralsCount = refData ? refData.length : 0;
    const referralHistory = refData ? refData.map((r: any) => ({
      name: r.profiles?.full_name || 'Community Member',
      date: new Date(r.created_at).toISOString().split('T')[0],
      amount: 150
    })) : [];

    const referralEarnings = referralsCount * 150;

    return {
      name: data.full_name || 'Homekart Customer',
      mobile: data.phone || fallbackPhone,
      referralCode: `HK${userId.slice(0, 5).toUpperCase()}`,
      referralEarnings,
      referralsCount,
      referralHistory
    };
  },

  async updateProfileName(userId: string, fullName: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', userId);

    return !error;
  }
};
