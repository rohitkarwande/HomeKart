import { supabase, isSupabaseConfigured } from './supabaseClient';

export const referralService = {
  async claimReferralCode(code: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      // Mock code validations: HOME123 is valid
      return code.toUpperCase() === 'HOME123';
    }

    // Format target referrer code e.g. HKXXXXX
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode.startsWith('HK')) {
      // Allow demo code HOME123
      return cleanCode === 'HOME123';
    }

    const { data: referrer, error } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: true }); // simplified look up by searching all profiles

    if (error || !referrer) return false;

    // Search profile starting with match
    const match = referrer.find((p: any) => p.id.slice(0, 5).toUpperCase() === cleanCode.replace('HK', ''));
    if (!match || match.id === userId) return false;

    // Check if user was already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .maybeSingle();

    if (existing) return false;

    // Log the referral
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: match.id,
        referred_user_id: userId,
        referral_code: cleanCode,
        status: 'pending'
      });

    return !insertError;
  }
};
