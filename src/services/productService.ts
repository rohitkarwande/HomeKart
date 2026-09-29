import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Product } from '../types';
import { SEED_PRODUCTS } from './seedData';

const buildSpecifications = (name: string, description: string): { [key: string]: string } => {
  const specs: { [key: string]: string } = {};
  const lowerName = name.toLowerCase();

  if (lowerName.includes('apple')) {
    specs['Source'] = 'Kashmir, India';
    specs['Type'] = 'Red Delicious';
    specs['Weight'] = '1 kg (Approx. 5-6 pieces)';
    specs['Shelf Life'] = 'Up to 7 days in refrigeration';
  } else if (lowerName.includes('mango')) {
    specs['Source'] = 'Devgad, Maharashtra';
    specs['Grade'] = 'A+';
    specs['Count'] = '6 pieces per box';
  } else if (lowerName.includes('rice')) {
    specs['Grain Length'] = 'Over 8.2 mm aged';
    specs['Aged'] = '12+ Months';
    specs['Pack Size'] = '5 kg';
  } else if (lowerName.includes('ghee')) {
    specs['Method'] = 'Traditional Bilona-style cooked';
    specs['Volume'] = '1 Litre';
    specs['Packaging'] = 'Glass Jar';
  } else if (lowerName.includes('headphone')) {
    specs['Battery Life'] = 'Up to 40 hours';
    specs['Noise Cancellation'] = 'Active (ANC)';
    specs['Connectivity'] = 'Bluetooth 5.2 & 3.5mm Aux';
    specs['Charging Time'] = '1.5 hours (USB-C)';
  } else if (lowerName.includes('smartwatch') || lowerName.includes('watch')) {
    specs['Screen Size'] = '1.43 inch AMOLED';
    specs['Sensors'] = 'Heart Rate, SpO2, Accelerometer';
    specs['Water Resistance'] = '5ATM (Swim-proof)';
    specs['Battery'] = 'Up to 10 days';
  } else if (description) {
    specs['Description'] = description;
  }
  return specs;
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return SEED_PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error.message);
      return SEED_PRODUCTS;
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      category: p.categories?.name || 'Uncategorized',
      originalPrice: p.original_price,
      groupPrice: p.group_price,
      imageUrl: p.image_url || '',
      rating: 4.5,
      reviewsCount: 12,
      specifications: buildSpecifications(p.name, p.description || ''),
      availability: p.stock > 0 ? 'in-stock' : 'out-of-stock',
      expiresAt: p.expires_at || undefined
    }));
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      return SEED_PRODUCTS.find(p => p.id === id) || null;
    }

    // Handle string matching fallback for seeds if id is like prod-1
    if (id.startsWith('prod-') && id.length < 10) {
      return SEED_PRODUCTS.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching product by id:', error?.message || 'Not found');
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.categories?.name || 'Uncategorized',
      originalPrice: data.original_price,
      groupPrice: data.group_price,
      imageUrl: data.image_url || '',
      rating: 4.5,
      reviewsCount: 12,
      specifications: buildSpecifications(data.name, data.description || ''),
      availability: data.stock > 0 ? 'in-stock' : 'out-of-stock',
      expiresAt: data.expires_at || undefined
    };
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const slug = (product.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          slug,
          description: product.description || '',
          original_price: product.originalPrice,
          group_price: product.groupPrice,
          image_url: product.imageUrl,
          stock: 100,
          is_active: true
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Error inserting product into Supabase:', error?.message);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: product.category || 'Staples',
        originalPrice: data.original_price,
        groupPrice: data.group_price,
        imageUrl: data.image_url || '',
        rating: 5.0,
        reviewsCount: 1,
        specifications: product.specifications || buildSpecifications(data.name, data.description || ''),
        availability: 'in-stock',
        sellerRole: product.sellerRole,
        companyName: product.companyName,
        moq: product.moq,
        approvalStatus: product.approvalStatus,
        submittedBy: product.submittedBy,
        deliveryEstDate: product.deliveryEstDate
      };
    } catch (e) {
      console.error('Failed to create product in DB:', e);
      return null;
    }
  }
};

export const categoryService = {
  async getCategories() {
    if (!isSupabaseConfigured) {
      return [
        { id: 'cat-1', name: 'Fruits & Veggies', slug: 'fruits-vegetables' },
        { id: 'cat-2', name: 'Staples & Grocery', slug: 'staples-grocery' },
        { id: 'cat-3', name: 'Electronics & Wearables', slug: 'electronics-wearables' }
      ];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error.message);
      return [];
    }

    return data;
  }
};
