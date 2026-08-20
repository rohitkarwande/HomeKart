import type { Product, DropPoint, Group } from '../types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'da7a1000-0000-0000-0000-000000000001',
    name: 'Premium Herbal Face Pack',
    description: 'Deep cleansing and rejuvenating herbal face pack enriched with neem, turmeric, and sandalwood extracts for naturally glowing skin.',
    category: 'Salon Products',
    originalPrice: 350,
    groupPrice: 249,
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 112,
    specifications: {
      'Skin Type': 'All Skin Types',
      'Ingredients': 'Neem, Sandalwood, Turmeric, Kaolin Clay',
      'Weight': '100g',
      'Form': 'Powder/Paste'
    },
    availability: 'in-stock',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'da7a1000-0000-0000-0000-000000000002',
    name: 'Nourishing Massage Cream',
    description: 'Intense hydration massage cream with vitamin E and aloe vera. Restores skin elasticity, promotes cell renewal, and leaves skin soft and supple.',
    category: 'Salon Products',
    originalPrice: 490,
    groupPrice: 349,
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 85,
    specifications: {
      'Key Benefit': 'Intense Hydration & Elasticity',
      'Active Ingredients': 'Vitamin E, Aloe Vera, Almond Oil',
      'Weight': '200g'
    },
    availability: 'in-stock',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'da7a1000-0000-0000-0000-000000000003',
    name: 'Hydrating Hair Spa Cream',
    description: 'Deep conditioning hair spa treatment cream that nourishes hair roots, repairs split ends, and controls frizz for silky, shiny hair.',
    category: 'Salon Products',
    originalPrice: 850,
    groupPrice: 599,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 154,
    specifications: {
      'Hair Type': 'Dry & Damaged Hair',
      'Volume': '500g',
      'Key Benefits': 'Frizz Control & Nourishment'
    },
    availability: 'in-stock',
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'da7a1000-0000-0000-0000-000000000004',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Experience high-fidelity sound and elite active noise cancellation. 40 hours of battery life with comfortable memory foam ear cushions.',
    category: 'Tech Products',
    originalPrice: 2999,
    groupPrice: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 142,
    specifications: {
      'Battery Life': 'Up to 40 hours',
      'Noise Cancellation': 'Active (ANC)',
      'Connectivity': 'Bluetooth 5.2 & 3.5mm Aux',
      'Charging Time': '1.5 hours (USB-C)'
    },
    availability: 'in-stock',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'da7a1000-0000-0000-0000-000000000005',
    name: 'Smart Fitness Smartwatch GPS',
    description: 'Advanced fitness tracker with built-in GPS tracker, heart rate monitor, sleep analysis scoring, and notifications display screen.',
    category: 'Tech Products',
    originalPrice: 3499,
    groupPrice: 2899,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewsCount: 98,
    specifications: {
      'Screen Size': '1.43 inch AMOLED',
      'Sensors': 'GPS, Heart Rate, SpO2',
      'Water Resistance': '5ATM (Swim-proof)',
      'Battery': 'Up to 10 days'
    },
    availability: 'in-stock',
    expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_DROP_POINTS: DropPoint[] = [
  {
    id: 'd70b1000-0000-0000-0000-000000000001',
    name: 'Hiranandani Gardens Point',
    area: 'Powai',
    distance: '1.2 km',
    address: 'Shop No. 12, Galleria Arcade, Hiranandani Gardens, Powai',
    phone: '+91 98200 12345'
  },
  {
    id: 'd70b1000-0000-0000-0000-000000000002',
    name: 'Chandivali Farm Road Point',
    area: 'Chandivali',
    distance: '2.0 km',
    address: 'Building 4A, Raheja Vihar, Chandivali Farm Road, Andheri East',
    phone: '+91 98199 54321'
  },
  {
    id: 'd70b1000-0000-0000-0000-000000000003',
    name: 'Andheri East Metro Station Point',
    area: 'Andheri East',
    distance: '3.4 km',
    address: 'Shop 2, Metro Plaza, Kurla Road, Andheri East',
    phone: '+91 99300 98765'
  },
  {
    id: 'd70b1000-0000-0000-0000-000000000004',
    name: 'Bandra Carter Road Point',
    area: 'Bandra West',
    distance: '5.1 km',
    address: 'Flat 101, Sea Breeze Apartments, Carter Road, Bandra West',
    phone: '+91 97700 11223'
  }
];

export const SEED_GROUPS = (products: Product[], dropPoints: DropPoint[]): Group[] => [
  {
    id: 'grp-1',
    productId: 'da7a1000-0000-0000-0000-000000000001',
    productName: products[0]?.name || 'Premium Herbal Face Pack',
    productImage: products[0]?.imageUrl || 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500&auto=format&fit=crop&q=80',
    groupPrice: products[0]?.groupPrice || 249,
    originalPrice: products[0]?.originalPrice || 350,
    savings: (products[0]?.originalPrice || 350) - (products[0]?.groupPrice || 249),
    currentMembers: 3,
    targetMembers: 5,
    memberNames: ['Rohit S.', 'Amit K.', 'Priya D.'],
    status: 'Open',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    dropPointId: dropPoints[1]?.id || 'd70b1000-0000-0000-0000-000000000002',
    dropPointName: dropPoints[1]?.name || 'Chandivali Farm Road Point'
  },
  {
    id: 'grp-2',
    productId: 'da7a1000-0000-0000-0000-000000000002',
    productName: products[1]?.name || 'Nourishing Massage Cream',
    productImage: products[1]?.imageUrl || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=80',
    groupPrice: products[1]?.groupPrice || 349,
    originalPrice: products[1]?.originalPrice || 490,
    savings: (products[1]?.originalPrice || 490) - (products[1]?.groupPrice || 349),
    currentMembers: 4,
    targetMembers: 5,
    memberNames: ['Sneha R.', 'Vikram M.', 'Anjali T.', 'Kunal G.'],
    status: 'Almost Full',
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    dropPointId: dropPoints[0]?.id || 'd70b1000-0000-0000-0000-000000000001',
    dropPointName: dropPoints[0]?.name || 'Hiranandani Gardens Point'
  },
  {
    id: 'grp-3',
    productId: 'da7a1000-0000-0000-0000-000000000005',
    productName: products[4]?.name || 'Smart Fitness Smartwatch GPS',
    productImage: products[4]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    groupPrice: products[4]?.groupPrice || 2899,
    originalPrice: products[4]?.originalPrice || 3499,
    savings: (products[4]?.originalPrice || 3499) - (products[4]?.groupPrice || 2899),
    currentMembers: 5,
    targetMembers: 5,
    memberNames: ['Rajesh V.', 'Deepa P.', 'Vijay N.', 'Suman L.', 'Ravi B.'],
    status: 'Confirmed',
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dropPointId: dropPoints[1]?.id || 'd70b1000-0000-0000-0000-000000000002',
    dropPointName: dropPoints[1]?.name || 'Chandivali Farm Road Point'
  }
];
