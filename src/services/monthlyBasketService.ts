import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { MonthlyBasketItem } from '../types';

export const monthlyBasketService = {
  async getOrCreateBasketId(userId: string): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const { data: existing } = await supabase
      .from('monthly_baskets')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newBasket, error } = await supabase
      .from('monthly_baskets')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating monthly basket:', error.message);
      return null;
    }

    return newBasket.id;
  },

  async getBasket(userId: string): Promise<MonthlyBasketItem[]> {
    if (!isSupabaseConfigured) return [];

    const basketId = await this.getOrCreateBasketId(userId);
    if (!basketId) return [];

    const { data, error } = await supabase
      .from('monthly_basket_items')
      .select('*')
      .eq('basket_id', basketId);

    if (error) {
      console.error('Error fetching monthly basket items:', error.message);
      return [];
    }

    return data.map((item: any) => ({
      productId: item.product_id,
      quantity: item.quantity
    }));
  },

  async addToBasket(userId: string, productId: string, quantity: number): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const basketId = await this.getOrCreateBasketId(userId);
    if (!basketId) return false;

    // Check if product is already in the monthly basket
    const { data: existing } = await supabase
      .from('monthly_basket_items')
      .select('*')
      .eq('basket_id', basketId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('monthly_basket_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('monthly_basket_items')
        .insert({
          basket_id: basketId,
          product_id: productId,
          quantity
        });
      return !error;
    }
  },

  async removeFromBasket(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const basketId = await this.getOrCreateBasketId(userId);
    if (!basketId) return false;

    const { error } = await supabase
      .from('monthly_basket_items')
      .delete()
      .eq('basket_id', basketId)
      .eq('product_id', productId);

    return !error;
  },

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const basketId = await this.getOrCreateBasketId(userId);
    if (!basketId) return false;

    const { error } = await supabase
      .from('monthly_basket_items')
      .update({ quantity })
      .eq('basket_id', basketId)
      .eq('product_id', productId);

    return !error;
  }
};
