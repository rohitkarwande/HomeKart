import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { DropPoint } from '../types';

export const dropPointService = {
  async getDropPoints(): Promise<DropPoint[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'drop-1',
          name: 'Hiranandani Gardens Point',
          area: 'Powai',
          distance: '1.2 km away',
          address: 'Shop No. 12, Galleria Arcade, Hiranandani Gardens, Powai',
          phone: '+91 98200 12345'
        },
        {
          id: 'drop-2',
          name: 'Chandivali Farm Road Point',
          area: 'Chandivali',
          distance: '2.0 km away',
          address: 'Building 4A, Raheja Vihar, Chandivali Farm Road, Andheri East',
          phone: '+91 98199 54321'
        },
        {
          id: 'drop-3',
          name: 'Andheri East Metro Station Point',
          area: 'Andheri East',
          distance: '3.5 km away',
          address: 'Shop 2, Metro Plaza, Kurla Road, Andheri East',
          phone: '+91 99300 98765'
        },
        {
          id: 'drop-4',
          name: 'Bandra Carter Road Point',
          area: 'Bandra West',
          distance: '6.4 km away',
          address: 'Flat 101, Sea Breeze Apartments, Carter Road, Bandra West',
          phone: '+91 97700 11223'
        }
      ];
    }

    const { data, error } = await supabase
      .from('drop_points')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching drop points:', error.message);
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      area: d.area,
      distance: 'Local Point',
      address: d.address,
      phone: d.phone || ''
    }));
  }
};
