import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Notification } from '../types';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }

    return data.map((n: any) => ({
      id: n.id,
      message: n.message,
      timestamp: this.formatRelativeTime(n.created_at),
      type: this.mapType(n.type),
      read: n.is_read
    }));
  },

  async markAsRead(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    return !error;
  },

  async addNotification(userId: string, message: string, type: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Homekart Update',
        message,
        type
      });

    return !error;
  },

  formatRelativeTime(isoString: string): string {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return new Date(isoString).toLocaleDateString();
  },

  mapType(type: string): any {
    if (type === 'success') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'error') return 'error';
    return 'info';
  }
};
