import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Group, DropPoint, LeaderProfile, Order, Notification, UserProfile, MonthlyBasketItem, GroupStatusType, UserRole, SellerKycApplication } from '../types';
import { SEED_PRODUCTS, SEED_DROP_POINTS, SEED_GROUPS } from '../services/seedData';

// Service Imports
import { supabase, isSupabaseConfigured as isSupabaseConfiguredOriginal } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { groupService } from '../services/groupService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { dropPointService } from '../services/dropPointService';
import { referralService } from '../services/referralService';
import { leaderService } from '../services/leaderService';
import { notificationService } from '../services/notificationService';
import { monthlyBasketService } from '../services/monthlyBasketService';
import { calculateDynamicPrice } from '../utils/pricing';

interface HomekartStore {
  // Navigation Routing
  activePage: string;
  pageParams: any;
  setPage: (page: string, params?: any) => void;

  // Real-world User Roles (Buyer, Supplier, Admin)
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Seller KYC Workflow
  kycApplications: SellerKycApplication[];
  submitSellerKyc: (kycData: {
    companyName: string;
    gstin: string;
    panNumber: string;
    businessAddress: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  }) => Promise<void>;
  approveSellerKyc: (applicationId: string) => Promise<void>;
  rejectSellerKyc: (applicationId: string, reason?: string) => Promise<void>;

  // Authentication
  loginWithPhonePassword: (phone: string, password?: string) => Promise<boolean>;
  loginAdmin: (email: string, password?: string) => Promise<boolean>;
  registerUser: (name: string, phone: string, password?: string, interestedCategories?: string[]) => Promise<boolean>;
  updateUserInterestedCategories: (categories: string[]) => Promise<boolean>;

  // Categories
  categories: string[];
  addCategory: (categoryName: string, description?: string) => Promise<void>;

  // Product Listings & Approvals Workflow
  addSupplierProduct: (productData: Partial<Product>) => Promise<Product>;
  addAdminProduct: (productData: Partial<Product>) => Promise<Product>;
  approveProduct: (productId: string) => Promise<void>;
  rejectProduct: (productId: string) => Promise<void>;

  // Cart Filling Dynamic Pricing & Group Refunds
  updateGroupPriceByAdmin: (productId: string, newGroupPrice: number) => Promise<void>;
  processGroupRefund: (groupId: string, reason?: string) => Promise<void>;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Auth
  user: UserProfile | null;
  login: (name: string, mobile: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<boolean>;

  // Data Lists
  products: Product[];
  groups: Group[];
  dropPoints: DropPoint[];
  selectedDropPoint: DropPoint;
  setSelectedDropPoint: (dp: DropPoint) => void;
  isLoading: boolean;

  // Cart
  cart: { product: Product; quantity: number; isGroupBuy: boolean; groupId?: string }[];
  addToCart: (product: Product, quantity: number, isGroupBuy: boolean, groupId?: string) => Promise<void>;
  removeFromCart: (productId: string, isGroupBuy: boolean, groupId?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, isGroupBuy: boolean, groupId?: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;

  // Groups actions
  joinGroupDirectly: (groupId: string) => Promise<void>;
  createGroupForProduct: (productId: string) => Promise<string>;
  simulateFriendJoin: (groupId: string) => Promise<void>;

  // Leaders
  leaderProfile: LeaderProfile;
  submitLeaderApplication: (appData: { name: string; mobile: string; area: string; preferredDropPointId: string }) => Promise<void>;
  approveLeaderApplication: () => Promise<void>;
  rejectLeaderApplication: () => Promise<void>;
  resetLeaderApplication: () => Promise<void>;
  withdrawLeaderEarnings: (amount: number) => Promise<boolean>;

  // Referrals
  claimReferralCode: (code: string) => Promise<boolean>;
  promoDiscount: number;
  appliedPromoCode: string;

  // Monthly Basket
  monthlyBasket: MonthlyBasketItem[];
  addToMonthlyBasket: (productId: string, quantity?: number) => Promise<void>;
  removeFromMonthlyBasket: (productId: string) => Promise<void>;
  updateMonthlyBasketQuantity: (productId: string, quantity: number) => Promise<void>;

  // Notifications
  notifications: Notification[];
  markNotificationsAsRead: () => Promise<void>;
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
}

const HomekartContext = createContext<HomekartStore | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'homekart_state_v1';

const SEED_KYC_APPLICATIONS: SellerKycApplication[] = [
  {
    id: 'kyc-101',
    userId: 'usr-9876543210',
    applicantName: 'Ramesh Patel',
    phone: '9876543210',
    companyName: 'Organic Harvest Farms Pvt Ltd',
    gstin: '27AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    businessAddress: 'Plot 42, APMC Market Yard, Vashi, Navi Mumbai, 400703',
    bankName: 'HDFC Bank',
    accountNumber: '50100234567890',
    ifscCode: 'HDFC0001234',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  }
];

export const HomekartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state
  const [stateLoaded, setStateLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePageState] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Seller KYC Applications State
  const [kycApplications, setKycApplications] = useState<SellerKycApplication[]>(() => {
    try {
      const stored = localStorage.getItem('homekart_kyc_apps_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return SEED_KYC_APPLICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('homekart_kyc_apps_v1', JSON.stringify(kycApplications));
    } catch (e) {}
  }, [kycApplications]);

  // Core Data sets
  const [user, setUser] = useState<UserProfile | null>(null);

  // Auto-sync active user's role and kycStatus with approved/rejected kycApplications
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const userPhoneDigits = user.mobile ? user.mobile.replace(/\D/g, '').slice(-10) : '';

    const matchingApp = kycApplications.find(a => {
      const appPhoneDigits = a.phone ? a.phone.replace(/\D/g, '').slice(-10) : '';
      return (userPhoneDigits && appPhoneDigits && userPhoneDigits === appPhoneDigits) ||
             (user.id && a.userId === user.id);
    });

    if (matchingApp) {
      if (matchingApp.status === 'approved') {
        if (user.role !== 'supplier' || user.kycStatus !== 'approved') {
          setUser(prev => prev ? {
            ...prev,
            role: 'supplier',
            kycStatus: 'approved',
            kycApplication: matchingApp
          } : null);
        }
      } else if (matchingApp.status === 'rejected') {
        if (user.kycStatus !== 'rejected') {
          setUser(prev => prev ? {
            ...prev,
            kycStatus: 'rejected',
            kycApplication: matchingApp
          } : null);
        }
      } else if (matchingApp.status === 'pending') {
        if (user.kycStatus !== 'pending') {
          setUser(prev => prev ? {
            ...prev,
            kycStatus: 'pending',
            kycApplication: matchingApp
          } : null);
        }
      }
    }
  }, [kycApplications, user?.mobile, user?.id, user?.role, user?.kycStatus]);

  // Core Role derived from User Profile
  const userRole: UserRole = user?.role || 'buyer';
  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('homekart_categories_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [
      'All',
      'Vegetables & Fruits',
      'Tech Products',
      'Clothes & Fashion',
      'Salon Products',
      'Staples',
      'Personal Care',
      'Home Essentials',
      'Dairy & Bakery',
      'Beverages',
      'Snacks'
    ];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('homekart_products_v1');
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          SEED_PRODUCTS.forEach(sp => {
            if (!merged.some(p => p.id === sp.id)) {
              merged.push(sp);
            }
          });
          return merged;
        }
      }
    } catch (e) {
      console.error('Failed to load initial products from localStorage:', e);
    }
    return SEED_PRODUCTS;
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [dropPoints, setDropPoints] = useState<DropPoint[]>(SEED_DROP_POINTS);
  const [selectedDropPoint, setSelectedDropPointState] = useState<DropPoint>(SEED_DROP_POINTS[1]); // Powai default

  // User details
  const [cart, setCart] = useState<{ product: Product; quantity: number; isGroupBuy: boolean; groupId?: string }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [leaderProfile, setLeaderProfile] = useState<LeaderProfile>({
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
  });
  const [monthlyBasket, setMonthlyBasket] = useState<MonthlyBasketItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Temp login storage for verification
  const [tempName, setTempName] = useState(() => sessionStorage.getItem('homekart_temp_name') || '');
  const [tempMobile, setTempMobile] = useState(() => sessionStorage.getItem('homekart_temp_mobile') || '');
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Dynamic DB active check shadowing isSupabaseConfigured inside the Provider scope
  const isSupabaseConfigured = isSupabaseConfiguredOriginal && authUserId !== 'mock-user-uuid';

  // Persist products and categories permanently whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('homekart_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('homekart_categories_v1', JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  }, [categories]);

  // Load database metadata on mount (Products, Groups, Drop Points)
  useEffect(() => {
    const loadMetadata = async () => {
      if (isSupabaseConfigured) {
        setIsLoading(true);
        try {
          const dbProducts = await productService.getProducts();
          if (dbProducts.length > 0) {
            setProducts(prev => {
              const merged = [...dbProducts];
              prev.forEach(p => {
                if (!merged.some(dbP => dbP.id === p.id)) {
                  merged.unshift(p);
                }
              });
              return merged;
            });
          }

          const dbDropPoints = await dropPointService.getDropPoints();
          if (dbDropPoints.length > 0) {
            setDropPoints(dbDropPoints);
            const defaultPt = dbDropPoints.find(d => d.name.includes('Hiranandani')) || dbDropPoints[0];
            setSelectedDropPointState(defaultPt);
          }

          const dbGroups = await groupService.getGroups();
          setGroups(dbGroups);
        } catch (e) {
          console.error('Failed to initialize database metadata, using seeds:', e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`Supabase Auth state changed: ${event}`);
      setIsLoading(true);
      try {
        if (session?.user) {
          const userId = session.user.id;
          const phone = session.user.phone || '';
          setAuthUserId(userId);

          // Fetch user data
          const profile = await authService.getProfile(userId, phone);
          setUser(profile);

          const dbCart = await cartService.getCart(userId);

          // Merge anonymous cart if present
          const anonCartStored = localStorage.getItem('homekart_anonymous_cart');
          let finalCart = dbCart;
          if (anonCartStored) {
            try {
              const anonCart = JSON.parse(anonCartStored);
              if (anonCart.length > 0) {
                for (const item of anonCart) {
                  await cartService.addToCart(userId, item.product.id, item.quantity, item.isGroupBuy, item.groupId);
                }
                finalCart = await cartService.getCart(userId);
              }
            } catch (e) {
              console.error('Error merging anonymous cart:', e);
            } finally {
              localStorage.removeItem('homekart_anonymous_cart');
            }
          }
          setCart(finalCart);

          const dbBasket = await monthlyBasketService.getBasket(userId);
          setMonthlyBasket(dbBasket);

          const dbOrders = await orderService.getOrders(userId);
          setOrders(dbOrders);

          const dbLeader = await leaderService.getLeaderProfile(userId);
          setLeaderProfile(dbLeader);

          const dbNotifications = await notificationService.getNotifications(userId);
          setNotifications(dbNotifications);
        } else {
          setAuthUserId(null);
          setUser(null);

          // Load anonymous cart from local storage
          const stored = localStorage.getItem('homekart_anonymous_cart');
          if (stored) {
            setCart(JSON.parse(stored));
          } else {
            setCart([]);
          }

          setMonthlyBasket([]);
          setOrders([]);
          setLeaderProfile({
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
          });
          setNotifications([]);
        }
      } catch (err) {
        console.error('Error handling auth state change:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save anonymous cart updates to local storage
  useEffect(() => {
    if (!authUserId) {
      try {
        localStorage.setItem('homekart_anonymous_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save anonymous cart to local storage:', e);
      }
    }
  }, [cart, authUserId]);

  // Real-time synchronization subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    console.log('Initializing real-time database subscriptions...');

    const channel = supabase
      .channel('homekart-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        async (payload: any) => {
          console.log('Real-time groups change detected:', payload);
          const dbGroups = await groupService.getGroups();
          setGroups(dbGroups);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        async (payload: any) => {
          console.log('Real-time group_members change detected:', payload);
          const dbGroups = await groupService.getGroups();
          setGroups(dbGroups);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload: any) => {
          console.log('Real-time orders change detected:', payload);
          if (authUserId) {
            const dbOrders = await orderService.getOrders(authUserId);
            setOrders(dbOrders);
          }
        }
      )
      .subscribe((status: string) => {
        console.log(`Real-time subscription status: ${status}`);
      });

    return () => {
      console.log('Cleaning up real-time database subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured, authUserId]);

  // Local Storage fallback mount check
  useEffect(() => {
    if (isSupabaseConfigured) {
      setStateLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        if (parsed.user) setUser(parsed.user);
        if (parsed.groups) setGroups(parsed.groups);
        else setGroups(SEED_GROUPS(SEED_PRODUCTS, SEED_DROP_POINTS));
        if (parsed.selectedDropPoint) setSelectedDropPointState(parsed.selectedDropPoint);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.leaderProfile) setLeaderProfile(parsed.leaderProfile);
        if (parsed.monthlyBasket) setMonthlyBasket(parsed.monthlyBasket);
        if (parsed.notifications) setNotifications(parsed.notifications);
        else setNotifications(getDefaultNotifications());
      } else {
        setGroups(SEED_GROUPS(SEED_PRODUCTS, SEED_DROP_POINTS));
        setNotifications(getDefaultNotifications());
        setUser({
          name: 'Sneha Sharma',
          mobile: '9999988888',
          referralCode: 'SNEH123',
          referralEarnings: 450,
          referralsCount: 3,
          referralHistory: [
            { name: 'Rohit Sharma', date: '2026-08-10', amount: 150 },
            { name: 'Amit Kumar', date: '2026-08-12', amount: 150 },
            { name: 'Priya Das', date: '2026-08-14', amount: 150 }
          ]
        });
        setOrders(getDefaultOrders());
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    setStateLoaded(true);
    setIsLoading(false);
  }, []);

  // Save state on updates (only in LocalStorage fallback mode)
  useEffect(() => {
    if (isSupabaseConfigured || !stateLoaded) return;
    try {
      const stateToStore = {
        products,
        categories,
        user,
        groups,
        selectedDropPoint,
        cart,
        orders,
        leaderProfile,
        monthlyBasket,
        notifications
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (e) {
      console.error('Failed to save state to local storage:', e);
    }
  }, [products, categories, user, groups, selectedDropPoint, cart, orders, leaderProfile, monthlyBasket, notifications, stateLoaded]);

  // Routing wrapper with auth guard and hash sync
  const setPage = (page: string, params: any = {}) => {
    const protectedPages = [
      'checkout',
      'payment',
      'orderSuccess',
      'orders',
      'monthlyBasket',
      'referrals',
      'leader',
      'notifications',
      'profile',
      'settings',
      'sellerKyc'
    ];

    if (protectedPages.includes(page) && !user) {
      // Save target path & redirect to login step
      setActivePageState('auth');
      setPageParams({ step: 1, redirectPage: page, redirectParams: params });
      const targetHash = `#/login?redirect=${encodeURIComponent(page)}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      return;
    }

    setActivePageState(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'instant' as any });

    // Sync Hash
    let hash = `#/${page}`;
    if (page === 'home') hash = '#/';
    else if (page === 'auth') {
      const redirectPart = params.redirectPage ? `?redirect=${encodeURIComponent(params.redirectPage)}` : '';
      hash = params.step === 2 ? `#/otp${redirectPart}` : `#/login${redirectPart}`;
    } else if (page === 'shop') {
      const parts = [];
      const cat = params.category !== undefined ? params.category : selectedCategory;
      const search = params.search !== undefined ? params.search : searchQuery;
      if (cat && cat !== 'All') {
        parts.push(`category=${encodeURIComponent(cat)}`);
      }
      if (search) {
        parts.push(`search=${encodeURIComponent(search)}`);
      }
      const queryPart = parts.length > 0 ? `?${parts.join('&')}` : '';
      hash = `#/shop${queryPart}`;
    } else if (page === 'product' && params.id) {
      hash = `#/product?id=${encodeURIComponent(params.id)}`;
    } else if (page === 'groupDetail' && params.id) {
      hash = `#/groupDetail?id=${encodeURIComponent(params.id)}`;
    } else if (page === 'orders' && params.id) {
      hash = `#/orders?id=${encodeURIComponent(params.id)}`;
    }

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  };

  // URL Hash parser
  const parseHashAndNavigate = (hash: string) => {
    const path = hash.split('?')[0].replace('#', '');
    const searchParams = new URLSearchParams(hash.split('?')[1] || '');
    
    let page = 'home';
    let params: any = {};
    
    if (path === '/' || path === '/home' || path === '') {
      page = 'home';
    } else if (path === '/shop') {
      page = 'shop';
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      setSelectedCategory(category || 'All');
      setSearchQuery(search || '');
    } else if (path === '/category') {
      page = 'shop';
      const name = searchParams.get('name');
      setSelectedCategory(name || 'All');
      setSearchQuery('');
    } else if (path === '/product') {
      page = 'product';
      params = { id: searchParams.get('id') };
    } else if (path === '/groups') {
      page = 'groups';
    } else if (path === '/groupDetail') {
      page = 'groupDetail';
      params = { id: searchParams.get('id') };
    } else if (path === '/cart') {
      page = 'cart';
    } else if (path === '/checkout') {
      page = 'checkout';
    } else if (path === '/payment') {
      page = 'payment';
    } else if (path === '/orderSuccess') {
      page = 'orderSuccess';
    } else if (path === '/orders') {
      page = 'orders';
      const orderId = searchParams.get('id');
      if (orderId) {
        params = { id: orderId };
      }
    } else if (path === '/dropPoints') {
      page = 'dropPoints';
    } else if (path === '/monthlyBasket') {
      page = 'monthlyBasket';
    } else if (path === '/referrals') {
      page = 'referrals';
    } else if (path === '/leader') {
      page = 'leader';
    } else if (path === '/notifications') {
      page = 'notifications';
    } else if (path === '/profile') {
      page = 'profile';
    } else if (path === '/settings') {
      page = 'settings';
    } else if (path === '/login' || path === '/auth') {
      page = 'login';
      const redirect = searchParams.get('redirect');
      if (redirect) {
        params = { redirectPage: redirect };
      }
    } else if (path === '/otp') {
      page = 'otp';
      const redirect = searchParams.get('redirect');
      if (redirect) {
        params = { redirectPage: redirect };
      }
    } else if (path === '/admin') {
      page = 'admin';
    } else if (path === '/supplier') {
      page = 'supplier';
    } else if (path === '/sellerKyc') {
      page = 'sellerKyc';
    } else if (path === '/logout') {
      page = 'logout';
    } else {
      page = 'home';
    }

    const protectedPages = [
      'checkout',
      'payment',
      'orderSuccess',
      'orders',
      'monthlyBasket',
      'referrals',
      'leader',
      'notifications',
      'profile',
      'settings',
      'sellerKyc'
    ];

    if (page === 'logout') {
      logout();
      return;
    }

    if (protectedPages.includes(page) && !user) {
      setActivePageState('auth');
      setPageParams({ step: 1, redirectPage: page, redirectParams: params });
      if (window.location.hash !== '#/login') {
        window.history.replaceState(null, '', window.location.pathname + '#/login');
      }
    } else if ((page === 'login' || page === 'otp') && user) {
      setActivePageState('home');
      setPageParams({});
      if (window.location.hash !== '#/') {
        window.history.replaceState(null, '', window.location.pathname + '#/');
      }
    } else {
      setActivePageState(page === 'login' || page === 'otp' ? 'auth' : page);
      setPageParams(page === 'login' ? { step: 1 } : (page === 'otp' ? { step: 2 } : params));
      
      let targetHash = `#/${page}`;
      if (page === 'home') targetHash = '#/';
      else if (page === 'shop' && selectedCategory && selectedCategory !== 'All') {
        targetHash = `#/shop?category=${encodeURIComponent(selectedCategory)}`;
      } else if (page === 'product' && params.id) {
        targetHash = `#/product?id=${encodeURIComponent(params.id)}`;
      } else if (page === 'groupDetail' && params.id) {
        targetHash = `#/groupDetail?id=${encodeURIComponent(params.id)}`;
      } else if (page === 'orders' && params.id) {
        targetHash = `#/orders?id=${encodeURIComponent(params.id)}`;
      }
      
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', window.location.pathname + targetHash);
      }
    }
  };

  // Wrapped category selector updating URL hash without polluting history stack
  const handleSetSelectedCategory = (category: string) => {
    setSelectedCategory(category);
    if (activePage === 'shop') {
      const parts = [];
      if (category && category !== 'All') {
        parts.push(`category=${encodeURIComponent(category)}`);
      }
      if (searchQuery) {
        parts.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      const queryPart = parts.length > 0 ? `?${parts.join('&')}` : '';
      const hash = `#/shop${queryPart}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', window.location.pathname + hash);
      }
    }
  };

  // Wrapped search query updater with replaceState to safeguard history
  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (activePage === 'shop') {
      const parts = [];
      if (selectedCategory && selectedCategory !== 'All') {
        parts.push(`category=${encodeURIComponent(selectedCategory)}`);
      }
      if (query) {
        parts.push(`search=${encodeURIComponent(query)}`);
      }
      const queryPart = parts.length > 0 ? `?${parts.join('&')}` : '';
      const hash = `#/shop${queryPart}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', window.location.pathname + hash);
      }
    }
  };

  // Initial routing triggers
  useEffect(() => {
    if (!stateLoaded) return;
    
    // Legacy URL query params check (?product=X or ?group=X)
    const searchParams = new URLSearchParams(window.location.search);
    const legacyProduct = searchParams.get('product');
    const legacyGroup = searchParams.get('group');
    
    if (legacyProduct) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      setPage('product', { id: legacyProduct });
      return;
    }
    if (legacyGroup) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      setPage('groupDetail', { id: legacyGroup });
      return;
    }

    const initialHash = window.location.hash || '#/';
    parseHashAndNavigate(initialHash);
  }, [stateLoaded]);

  // Listener for browser back/forward buttons
  useEffect(() => {
    if (!stateLoaded) return;
    const handleHashChange = () => {
      parseHashAndNavigate(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [stateLoaded, user, selectedCategory, activePage]);

  const getDefaultNotifications = (): Notification[] => [
    {
      id: 'notif-1',
      message: 'Good news! Your group order for Premium Basmati Rice has been confirmed by the supplier.',
      timestamp: '2 hours ago',
      type: 'success',
      read: false
    },
    {
      id: 'notif-2',
      message: 'Sneha Sharma applied your referral code. You earned ₹150!',
      timestamp: '1 day ago',
      type: 'info',
      read: true
    }
  ];

  const getDefaultOrders = (): Order[] => [
    {
      id: 'HK98401',
      items: [
        {
          productId: 'prod-6',
          productName: 'Premium Basmati Rice (5kg)',
          productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
          quantity: 1,
          originalPrice: 750,
          groupPrice: 599,
          isGroupBuy: true
        }
      ],
      subtotal: 750,
      savings: 151,
      total: 599,
      paymentStatus: 'Successful',
      groupStatus: 'Completed',
      dropPoint: SEED_DROP_POINTS[0],
      pickupStatus: 'Picked Up',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        { title: 'ORDER PLACED', date: '10 days ago', completed: true },
        { title: 'PAYMENT CONFIRMED', date: '10 days ago', completed: true },
        { title: 'GROUP CONFIRMED', date: '9 days ago', completed: true },
        { title: 'SUPPLIER CONFIRMED', date: '9 days ago', completed: true },
        { title: 'READY FOR PICKUP', date: '8 days ago', completed: true },
        { title: 'PICKED UP', date: '8 days ago', completed: true }
      ]
    }
  ];

  // Auth Operations
  const login = async (name: string, mobile: string) => {
    setTempName(name);
    setTempMobile(mobile);
    sessionStorage.setItem('homekart_temp_name', name);
    sessionStorage.setItem('homekart_temp_mobile', mobile);    if (isSupabaseConfigured) {
      const res = await authService.login(mobile);
      if (!res.success) {
        console.error('Supabase OTP send failed:', res.error);
        sessionStorage.setItem('homekart_use_mock_otp', 'true');
        await addNotification(`SMS provider not configured or failed to send OTP. Mock OTP enabled (Use 123456).`, 'warning');
      } else {
        sessionStorage.removeItem('homekart_use_mock_otp');
        await addNotification(`OTP verification sent to +91 ${mobile}`, 'info');
      }
    } else {
      const loggedInUser = {
        name,
        mobile,
        referralCode: name.substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
        referralEarnings: 0,
        referralsCount: 0,
        referralHistory: []
      };
      setUser(loggedInUser);
      await addNotification(`Welcome to Homekart, ${name}! Login successful.`, 'success');
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    const useMockOtp = sessionStorage.getItem('homekart_use_mock_otp') === 'true';

    if (isSupabaseConfigured && !useMockOtp) {
      const { user: authUser, error } = await authService.verifyOtp(tempMobile, otp, tempName);
      if (error || !authUser) {
        await addNotification(`Verification failed: ${error || 'Invalid OTP'}`, 'error');
        return false;
      }

      setAuthUserId(authUser.id);
      
      // Fetch profile to check if it's existing or new
      const existingProfile = await authService.getProfile(authUser.id, tempMobile, tempName);
      let finalName = existingProfile.name;
      
      // If the profile name is default (new user registration) and we have tempName, update it!
      if ((existingProfile.name === 'Homekart Customer' || !existingProfile.name || existingProfile.name === '') && tempName) {
        await authService.updateProfileName(authUser.id, tempName);
        finalName = tempName;
      }
      
      const profile = { ...existingProfile, name: finalName, role: userRole };
      setUser(profile);
      
      sessionStorage.removeItem('homekart_temp_name');
      sessionStorage.removeItem('homekart_temp_mobile');
      await addNotification(`Welcome to Homekart, ${profile.name}!`, 'success');
      return true;
    }

    const mockValid = otp === '123456' || otp.length === 6;
    if (mockValid) {
      let loggedInUser: any = null;
      if (tempMobile === '9999988888') {
        // Load existing seeded profile
        loggedInUser = {
          name: 'Sneha Sharma',
          mobile: '9999988888',
          referralCode: 'SNEH123',
          referralEarnings: 450,
          referralsCount: 3,
          referralHistory: [
            { name: 'Rohit Sharma', date: '2026-08-10', amount: 150 },
            { name: 'Amit Kumar', date: '2026-08-12', amount: 150 },
            { name: 'Priya Das', date: '2026-08-14', amount: 150 }
          ],
          role: userRole
        };
      } else {
        // New user registration
        loggedInUser = {
          name: tempName || 'Homekart Customer',
          mobile: tempMobile,
          referralCode: (tempName || 'Customer').substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
          referralEarnings: 0,
          referralsCount: 0,
          referralHistory: [],
          role: userRole
        };
      }
      setUser(loggedInUser);
      setAuthUserId('mock-user-uuid');
      sessionStorage.removeItem('homekart_temp_name');
      sessionStorage.removeItem('homekart_temp_mobile');
      sessionStorage.removeItem('homekart_use_mock_otp');
      await addNotification(`Welcome to Homekart, ${loggedInUser.name}!`, 'success');
      return true;
    }

    await addNotification('Invalid OTP. Please enter 123456 to verify in bypass mode.', 'error');
    return false;
  };

  // Seller KYC Workflow Implementation
  const submitSellerKyc = async (kycData: {
    companyName: string;
    gstin: string;
    panNumber: string;
    businessAddress: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  }) => {
    if (!user) return;
    const newApp: SellerKycApplication = {
      id: `kyc-${Date.now()}`,
      userId: user.mobile || user.id || 'usr-1',
      applicantName: user.name,
      phone: user.mobile,
      companyName: kycData.companyName,
      gstin: kycData.gstin,
      panNumber: kycData.panNumber,
      businessAddress: kycData.businessAddress,
      bankName: kycData.bankName,
      accountNumber: kycData.accountNumber,
      ifscCode: kycData.ifscCode,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    setKycApplications(prev => [newApp, ...prev.filter(a => a.phone !== user.mobile)]);
    const updatedUser: UserProfile = { ...user, kycStatus: 'pending', kycApplication: newApp };
    setUser(updatedUser);
    await addNotification(`🎉 Seller KYC Application submitted! Pending Admin verification.`, 'info');
  };

  const approveSellerKyc = async (applicationId: string) => {
    let approvedApp: SellerKycApplication | null = null;
    setKycApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        approvedApp = { ...app, status: 'approved' };
        return approvedApp;
      }
      return app;
    }));

    const app = approvedApp || kycApplications.find(a => a.id === applicationId);
    if (app) {
      const appDigits = app.phone ? app.phone.replace(/\D/g, '').slice(-10) : '';
      const userDigits = user?.mobile ? user.mobile.replace(/\D/g, '').slice(-10) : '';
      if (user && user.role !== 'admin' && (userDigits === appDigits || user.id === app.userId)) {
        setUser({
          ...user,
          role: 'supplier',
          kycStatus: 'approved',
          kycApplication: { ...app, status: 'approved' }
        });
      }
      await addNotification(`✅ Seller KYC Approved for "${app.applicantName}" (${app.companyName})! Promoted to Verified Seller.`, 'success');
    }
  };

  const rejectSellerKyc = async (applicationId: string, reason?: string) => {
    const rejectionText = reason || 'Business GST/PAN details did not match official registries.';
    setKycApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: 'rejected', rejectionReason: rejectionText };
      }
      return app;
    }));

    const app = kycApplications.find(a => a.id === applicationId);
    if (app) {
      const appDigits = app.phone ? app.phone.replace(/\D/g, '').slice(-10) : '';
      const userDigits = user?.mobile ? user.mobile.replace(/\D/g, '').slice(-10) : '';
      if (user && user.role !== 'admin' && (userDigits === appDigits || user.id === app.userId)) {
        setUser({
          ...user,
          kycStatus: 'rejected',
          kycApplication: { ...app, status: 'rejected', rejectionReason: rejectionText }
        });
      }
      await addNotification(`❌ Seller KYC Application for "${app?.applicantName || 'Applicant'}" was rejected.`, 'warning');
    }
  };

  // Real Authentication Methods
  const loginAdmin = async (email: string, password?: string): Promise<boolean> => {
    if (email.trim().toLowerCase() === 'admin@homekart.com' && (password === 'admin123' || !password)) {
      const adminUser: UserProfile = {
        id: 'admin-uuid',
        name: 'System Administrator',
        email: 'admin@homekart.com',
        mobile: '9999900000',
        role: 'admin',
        referralCode: 'ADMIN001',
        referralEarnings: 0,
        referralsCount: 0,
        referralHistory: []
      };
      setUser(adminUser);
      await addNotification(`👑 Admin Authentication Successful! Welcome System Admin.`, 'success');
      setPage('admin');
      return true;
    }
    await addNotification(`Invalid Admin Credentials! Use email: admin@homekart.com / password: admin123`, 'error');
    return false;
  };

  const loginWithPhonePassword = async (phone: string, _password?: string): Promise<boolean> => {
    const formattedPhone = phone.replace(/\D/g, '').slice(-10);
    if (!formattedPhone || formattedPhone.length < 10) return false;

    // Check if existing approved KYC exists for this phone
    const existingKyc = kycApplications.find(a => {
      const appDigits = a.phone ? a.phone.replace(/\D/g, '').slice(-10) : '';
      return appDigits === formattedPhone;
    });
    const isApprovedSeller = existingKyc && existingKyc.status === 'approved';
    const role: UserRole = isApprovedSeller ? 'supplier' : 'buyer';

    const loggedUser: UserProfile = {
      id: `usr-${formattedPhone}`,
      name: formattedPhone === '9999988888' ? 'Sneha Sharma' : `User ${formattedPhone.slice(-4)}`,
      mobile: formattedPhone,
      referralCode: `HK${formattedPhone.slice(-5)}`,
      referralEarnings: 150,
      referralsCount: 1,
      referralHistory: [],
      role,
      kycStatus: existingKyc ? existingKyc.status : 'none',
      kycApplication: existingKyc
    };

    setUser(loggedUser);
    await addNotification(`Welcome back, ${loggedUser.name}! Logged in as ${role.toUpperCase()}.`, 'success');
    if (role === 'supplier') setPage('supplier');
    else setPage('shop');
    return true;
  };

  const registerUser = async (name: string, phone: string, _password?: string, interestedCategories?: string[]): Promise<boolean> => {
    const formattedPhone = phone.replace(/\D/g, '').slice(-10);
    const newUser: UserProfile = {
      id: `usr-${formattedPhone}`,
      name: name.trim() || 'New Buyer',
      mobile: formattedPhone,
      referralCode: (name || 'HK').slice(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
      referralEarnings: 0,
      referralsCount: 0,
      referralHistory: [],
      role: 'buyer',
      kycStatus: 'none',
      interestedCategories: interestedCategories || ['Vegetables & Fruits', 'Tech Products']
    };

    setUser(newUser);
    if (isSupabaseConfigured && authUserId) {
      await authService.updateInterestedCategories(authUserId, newUser.interestedCategories || []);
    }
    await addNotification(`Welcome to HomeKart, ${newUser.name}! Your feed is tailored to your chosen categories.`, 'success');
    setPage('home');
    return true;
  };

  const updateUserInterestedCategories = async (categories: string[]): Promise<boolean> => {
    if (!user) {
      return false;
    }
    if (isSupabaseConfigured && authUserId) {
      await authService.updateInterestedCategories(authUserId, categories);
    }
    setUser(prev => prev ? { ...prev, interestedCategories: categories } : null);
    await addNotification('Your interested categories have been updated!', 'info');
    return true;
  };

  const updateProfile = async (newName: string): Promise<boolean> => {
    if (!user) return false;

    if (isSupabaseConfigured && authUserId) {
      const success = await authService.updateProfileName(authUserId, newName);
      if (success) {
        setUser(prev => prev ? { ...prev, name: newName } : null);
        return true;
      }
      return false;
    } else {
      // Prototype mode
      setUser(prev => prev ? { ...prev, name: newName } : null);
      return true;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await authService.logout();
    } else {
      setUser(null);
      setCart([]);
      setOrders([]);
      setMonthlyBasket([]);
      setLeaderProfile({
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
      });
      setNotifications([]);
    }
    setPromoDiscount(0);
    setAppliedPromoCode('');
    sessionStorage.removeItem('homekart_temp_name');
    sessionStorage.removeItem('homekart_temp_mobile');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('homekart_anonymous_cart');
    setPage('home');
  };

  const setSelectedDropPoint = (dp: DropPoint) => {
    setSelectedDropPointState(dp);
    addNotification(`Active drop point changed to ${dp.name}.`, 'info');
  };

  // Cart Management
  const addToCart = async (product: Product, quantity: number, isGroupBuy: boolean, groupId?: string) => {
    const newItem = { product, quantity, isGroupBuy, groupId };

    if (isSupabaseConfigured && authUserId) {
      const success = await cartService.addToCart(authUserId, product.id, quantity, isGroupBuy, groupId);
      if (success) {
        const dbCart = await cartService.getCart(authUserId);
        if (dbCart && dbCart.length > 0) {
          setCart(dbCart);
          addNotification(`Added ${product.name} to Cart.`, 'success');
          return;
        }
      }
    }

    setCart(prev => {
      const index = prev.findIndex(item => 
        item.product.id === product.id && 
        item.isGroupBuy === isGroupBuy && 
        (item.groupId || undefined) === (groupId || undefined)
      );
      let nextCart;
      if (index > -1) {
        const copy = [...prev];
        copy[index].quantity += quantity;
        nextCart = copy;
      } else {
        nextCart = [...prev, newItem];
      }
      try {
        localStorage.setItem('homekart_anonymous_cart', JSON.stringify(nextCart));
      } catch (e) {
        console.error('Error saving anonymous cart:', e);
      }
      return nextCart;
    });
    addNotification(`Added ${product.name} to Cart.`, 'success');
  };

  const removeFromCart = async (productId: string, isGroupBuy: boolean, groupId?: string) => {
    if (isSupabaseConfigured && authUserId) {
      await cartService.removeFromCart(authUserId, productId, isGroupBuy, groupId);
      const dbCart = await cartService.getCart(authUserId);
      if (dbCart) {
        setCart(dbCart);
      }
    }
    setCart(prev => {
      const nextCart = prev.filter(item => !(
        item.product.id === productId && 
        item.isGroupBuy === isGroupBuy && 
        (item.groupId || undefined) === (groupId || undefined)
      ));
      try {
        localStorage.setItem('homekart_anonymous_cart', JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });
  };

  const updateCartQuantity = async (productId: string, quantity: number, isGroupBuy: boolean, groupId?: string) => {
    if (quantity <= 0) {
      await removeFromCart(productId, isGroupBuy, groupId);
      return;
    }

    if (isSupabaseConfigured && authUserId) {
      await cartService.updateQuantity(authUserId, productId, isGroupBuy, groupId, quantity);
      const dbCart = await cartService.getCart(authUserId);
      if (dbCart && dbCart.length > 0) {
        setCart(dbCart);
        return;
      }
    }

    setCart(prev => {
      const nextCart = prev.map(item => 
        (item.product.id === productId && item.isGroupBuy === isGroupBuy && (item.groupId || undefined) === (groupId || undefined)) 
          ? { ...item, quantity } 
          : item
      );
      try {
        localStorage.setItem('homekart_anonymous_cart', JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });
  };

  const clearCart = async () => {
    if (isSupabaseConfigured && authUserId) {
      await cartService.clearCart(authUserId);
      setCart([]);
    } else {
      setCart([]);
      localStorage.removeItem('homekart_anonymous_cart');
    }
    setPromoDiscount(0);
    setAppliedPromoCode('');
  };

  // Join group directly
  const joinGroupDirectly = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      addNotification('Group deal not found.', 'error');
      return;
    }
    if (group.currentMembers >= group.targetMembers) {
      addNotification(`This group is already full and confirmed! You cannot join it.`, 'warning');
      return;
    }

    let prod = products.find(p => p.id === group.productId);
    if (!prod) {
      prod = {
        id: group.productId || `prod-${group.id}`,
        name: group.productName || 'Homekart Group Deal Product',
        description: 'Quality group buy product.',
        category: 'Staples',
        originalPrice: group.originalPrice || 500,
        groupPrice: group.groupPrice || 350,
        imageUrl: group.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 12,
        specifications: {},
        availability: 'in-stock',
        companyName: group.companyName
      };
    }

    await addToCart(prod, 1, true, group.id);
    setPage('cart');
  };

  const createGroupForProduct = async (productId: string): Promise<string> => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return '';

    if (isSupabaseConfigured && authUserId) {
      const dbGroupId = await groupService.createGroup(productId, authUserId, selectedDropPoint.id, prod.groupPrice);
      if (dbGroupId) {
        const dbGroups = await groupService.getGroups();
        setGroups(dbGroups);
        return dbGroupId;
      }
      return '';
    }

    const newId = `grp-${Date.now()}`;
    const newGroup: Group = {
      id: newId,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.imageUrl,
      groupPrice: prod.groupPrice,
      originalPrice: prod.originalPrice,
      savings: prod.originalPrice - prod.groupPrice,
      currentMembers: 1,
      targetMembers: 5,
      memberNames: [user?.name || 'You'],
      status: 'Open',
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      dropPointId: selectedDropPoint.id,
      dropPointName: selectedDropPoint.name
    };
    setGroups(prev => [newGroup, ...prev]);
    return newId;
  };

  // Friend simulation
  const simulateFriendJoin = async (groupId: string) => {
    if (isSupabaseConfigured) {
      const friendId = crypto.randomUUID();
      const friendNames = ['Aarav Mehta', 'Ananya Iyer', 'Kabir Sharma', 'Diya Patel', 'Rohan Das'];
      const nextFriendName = friendNames[Math.floor(Math.random() * friendNames.length)];
      
      // Seed dummy profile
      await supabase.from('profiles').insert({
        id: friendId,
        full_name: nextFriendName,
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`
      });

      // Add user membership
      await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: friendId,
        quantity: 1
      });

      // Trigger DB update transitions
      await groupService.updateGroupStatus(groupId);

      // Refresh data
      const dbGroups = await groupService.getGroups();
      setGroups(dbGroups);

      if (authUserId) {
        const dbOrders = await orderService.getOrders(authUserId);
        setOrders(dbOrders);
      }
      
      const updatedGroup = dbGroups.find(g => g.id === groupId);
      if (updatedGroup?.status === 'Confirmed') {
        // Also trigger simulated order advances
        setTimeout(async () => {
          await supabase.from('orders').update({
            status: 'ready_for_pickup',
            pickup_status: 'ready_for_pickup'
          }).eq('group_id', groupId);

          if (authUserId) {
            const dbOrders = await orderService.getOrders(authUserId);
            setOrders(dbOrders);
            addNotification(`Your group order is ready for pickup!`, 'success');
          }
        }, 8000);
      }
    } else {
      setGroups(prev => prev.map(grp => {
        if (grp.id !== groupId) return grp;
        if (grp.status === 'Completed' || grp.status === 'Cancelled' || grp.status === 'Confirmed' || grp.status === 'Ready for Pickup') return grp;

        const friends = ['Vijay R.', 'Neha P.', 'Karan S.', 'Arjun M.', 'Pooja T.'];
        const nextMemberIndex = grp.currentMembers;
        const nextMember = friends[nextMemberIndex % friends.length] || 'Community Member';

        const newMembers = grp.currentMembers + 1;
        let newStatus: GroupStatusType = grp.status;

        if (newMembers >= grp.targetMembers) {
          newStatus = 'Confirmed';
          addNotification(`Great news! Your group for ${grp.productName} is now CONFIRMED.`, 'success');
        } else if (newMembers === grp.targetMembers - 1) {
          newStatus = 'Almost Full';
        } else {
          newStatus = 'Joining';
        }

        setOrders(prevOrders => prevOrders.map(ord => {
          if (ord.groupId === groupId) {
            const updatedTimeline = [...ord.timeline];
            if (newStatus === 'Confirmed') {
              updatedTimeline[2] = { ...updatedTimeline[2], completed: true, date: 'Just now' };
              setTimeout(() => {
                setOrders(latestOrders => latestOrders.map(lo => {
                  if (lo.groupId === groupId) {
                    const latTimeline = [...lo.timeline];
                    latTimeline[3] = { ...latTimeline[3], completed: true, date: 'Just now' };
                    latTimeline[4] = { ...latTimeline[4], completed: true, date: 'Just now' };
                    addNotification(`Your order #${lo.id} is ready for pickup at ${lo.dropPoint.name}!`, 'success');
                    return { ...lo, groupStatus: 'Ready for Pickup', pickupStatus: 'Ready for Pickup', timeline: latTimeline } as Order;
                  }
                  return lo;
                }));
              }, 8000);
            }
            return { ...ord, groupStatus: newStatus, timeline: updatedTimeline } as Order;
          }
          return ord;
        }));

        return {
          ...grp,
          currentMembers: newMembers,
          memberNames: [...grp.memberNames, nextMember],
          status: newStatus
        };
      }));
    }
  };

  // Place Order Action
  const placeOrder = async (paymentMethod: string): Promise<Order | null> => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
    const cartTotal = cart.reduce((sum, item) => {
      const price = calculateDynamicPrice(item.product, item.isGroupBuy, item.groupId, groups, item.quantity);
      return sum + (price * item.quantity);
    }, 0);
    const finalTotal = Math.max(0, cartTotal - promoDiscount);
    const savings = subtotal - finalTotal;
    const isGroupBuyOrder = cart.some(item => item.isGroupBuy);

    if (isSupabaseConfigured && authUserId) {
      try {
        let associatedGroupId = cart[0].groupId;
        let groupStatus = 'N/A';

        if (isGroupBuyOrder) {
          if (associatedGroupId) {
            await groupService.joinGroup(associatedGroupId, authUserId);
            const dbGroups = await groupService.getGroups();
            const existingGroup = dbGroups.find(g => g.id === associatedGroupId);
            groupStatus = existingGroup ? existingGroup.status : 'Joining';
          } else {
            const newGrpId = await groupService.createGroup(cart[0].product.id, authUserId, selectedDropPoint.id, cart[0].product.groupPrice);
            associatedGroupId = newGrpId || undefined;
            groupStatus = 'Open';
          }
        }

        const dbOrder = await orderService.createOrder(
          authUserId,
          cart,
          selectedDropPoint,
          paymentMethod,
          subtotal,
          savings,
          finalTotal,
          associatedGroupId,
          associatedGroupId ? 'group_pending' : 'paid'
        );

        if (dbOrder) {
          await cartService.clearCart(authUserId);
          setCart([]);
          setPromoDiscount(0);
          setAppliedPromoCode('');

          const dbGroups = await groupService.getGroups();
          setGroups(dbGroups);

          const dbOrders = await orderService.getOrders(authUserId);
          setOrders(dbOrders);

          // Timers simulation
          if (isGroupBuyOrder && associatedGroupId && groupStatus !== 'Confirmed') {
            const gId = associatedGroupId;
            setTimeout(async () => {
              await simulateFriendJoin(gId);
            }, 5000);
          } else if (isGroupBuyOrder && associatedGroupId && groupStatus === 'Confirmed') {
            const gId = associatedGroupId;
            setTimeout(async () => {
              await supabase.from('orders').update({
                status: 'ready_for_pickup',
                pickup_status: 'ready_for_pickup'
              }).eq('group_id', gId);

              const dbOrders = await orderService.getOrders(authUserId);
              setOrders(dbOrders);
              addNotification(`Your group order is ready for pickup!`, 'success');
            }, 8000);
          }

          return dbOrder;
        }
      } catch (dbErr) {
        console.error('Error placing order in DB, using fallback order generation:', dbErr);
      }
    }

    // LocalStorage prototype mode
    const orderId = `HK${Math.floor(10000 + Math.random() * 90000)}`;
    let associatedGroupId = cart[0].groupId;
    let groupStatus: GroupStatusType | 'N/A' = 'N/A';

    if (isGroupBuyOrder) {
      if (associatedGroupId) {
        setGroups(prev => prev.map(grp => {
          if (grp.id === associatedGroupId) {
            const nextMembers = grp.currentMembers + 1;
            const updatedNames = [...grp.memberNames, user?.name || 'You'];
            const newStatus = nextMembers >= grp.targetMembers ? 'Confirmed' : (nextMembers === grp.targetMembers - 1 ? 'Almost Full' : 'Joining');

            if (newStatus === 'Confirmed') {
              addNotification(`Your group for ${grp.productName} is now confirmed!`, 'success');
            }
            return {
              ...grp,
              currentMembers: nextMembers,
              memberNames: updatedNames,
              status: newStatus
            };
          }
          return grp;
        }));
        const existingGroup = groups.find(g => g.id === associatedGroupId);
        groupStatus = existingGroup ? (existingGroup.currentMembers + 1 >= existingGroup.targetMembers ? 'Confirmed' : 'Joining') : 'Joining';
      } else {
        associatedGroupId = await createGroupForProduct(cart[0].product.id);
        groupStatus = 'Open';
        addNotification(`You started a new buying group for ${cart[0].product.name}! Invite friends to save together.`, 'success');
      }
    }

    const newOrder: Order = {
      id: orderId,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        quantity: item.quantity,
        originalPrice: item.product.originalPrice,
        groupPrice: item.product.groupPrice,
        isGroupBuy: item.isGroupBuy
      })),
      subtotal,
      savings,
      total: finalTotal,
      paymentStatus: 'Successful',
      groupStatus,
      dropPoint: selectedDropPoint,
      pickupStatus: 'Pending',
      date: new Date().toISOString(),
      groupId: associatedGroupId,
      timeline: [
        { title: 'ORDER PLACED', date: 'Just now', completed: true },
        { title: 'PAYMENT CONFIRMED', date: 'Just now', completed: true },
        { title: 'GROUP CONFIRMED', date: isGroupBuyOrder && groupStatus === 'Confirmed' ? 'Just now' : 'Pending', completed: isGroupBuyOrder && groupStatus === 'Confirmed' },
        { title: 'SUPPLIER CONFIRMED', date: 'Pending', completed: false },
        { title: 'READY FOR PICKUP', date: 'Pending', completed: false },
        { title: 'PICKED UP', date: 'Pending', completed: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setPromoDiscount(0);
    setAppliedPromoCode('');
    addNotification(`Order placed successfully! ID: ${orderId}`, 'success');

    if (isGroupBuyOrder && associatedGroupId && groupStatus !== 'Confirmed') {
      const gId = associatedGroupId;
      setTimeout(() => {
        simulateFriendJoin(gId);
      }, 5000);
    } else if (isGroupBuyOrder && associatedGroupId && groupStatus === 'Confirmed') {
      const gId = associatedGroupId;
      setTimeout(() => {
        setOrders(latestOrders => latestOrders.map(lo => {
          if (lo.groupId === gId) {
            const latTimeline = [...lo.timeline];
            latTimeline[2] = { ...latTimeline[2], completed: true, date: 'Just now' };
            latTimeline[3] = { ...latTimeline[3], completed: true, date: 'Just now' };
            latTimeline[4] = { ...latTimeline[4], completed: true, date: 'Just now' };
            addNotification(`Your order #${lo.id} is ready for pickup at ${lo.dropPoint.name}!`, 'success');
            return { ...lo, groupStatus: 'Ready for Pickup', pickupStatus: 'Ready for Pickup', timeline: latTimeline } as Order;
          }
          return lo;
        }));
      }, 8000);
    }

    return newOrder;
  };

  const cancelOrder = async (orderId: string) => {
    const refundTxnId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;
      return {
        ...ord,
        groupStatus: 'Cancelled',
        paymentStatus: 'Refund Initiated',
        refundDetails: {
          amount: ord.total,
          date: new Date().toISOString(),
          reason: 'Order cancelled by buyer before pickup.',
          transactionId: refundTxnId
        },
        timeline: [
          { title: 'ORDER PLACED', date: new Date(ord.date).toLocaleDateString(), completed: true },
          { title: 'ORDER CANCELLED', date: 'Just now', completed: true },
          { title: 'REFUND INITIATED', date: 'Just now', completed: true },
          { title: 'REFUND COMPLETED', date: 'Pending', completed: false }
        ]
      } as Order;
    }));

    await addNotification(`Order #${orderId} cancelled. Refund initiated!`, 'warning');

    if (isSupabaseConfigured && authUserId) {
      try {
        await orderService.cancelOrder(orderId);
      } catch (e) {
        console.error('Error cancelling order in Supabase DB:', e);
      }
    }

    // Simulate refund completion after 4 seconds
    setTimeout(() => {
      setOrders(prev => prev.map(ord => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          paymentStatus: 'Refunded',
          groupStatus: 'Cancelled',
          timeline: [
            { title: 'ORDER PLACED', date: new Date(ord.date).toLocaleDateString(), completed: true },
            { title: 'ORDER CANCELLED', date: 'Just now', completed: true },
            { title: 'REFUND INITIATED', date: 'Just now', completed: true },
            { title: 'REFUND COMPLETED', date: 'Just now', completed: true }
          ]
        } as Order;
      }));
      addNotification(`Money refund of ₹${refundTxnId} for Order #${orderId} completed successfully!`, 'info');
    }, 4000);
  };

  const completeOrder = async (orderId: string) => {
    if (isSupabaseConfigured && authUserId) {
      const success = await orderService.completeOrder(orderId);
      if (success) {
        const dbOrders = await orderService.getOrders(authUserId);
        setOrders(dbOrders);
        addNotification(`Order #${orderId} has been collected!`, 'success');
      }
    } else {
      setOrders(prev => prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const updatedTimeline = [...ord.timeline];
        updatedTimeline[5] = { title: 'PICKED UP', date: 'Just now', completed: true };
        return {
          ...ord,
          pickupStatus: 'Picked Up',
          groupStatus: 'Completed',
          timeline: updatedTimeline
        } as Order;
      }));
      addNotification(`Order #${orderId} has been successfully collected! Thank you.`, 'success');
    }
  };

  // Leaders Dashboard
  const submitLeaderApplication = async (appData: { name: string; mobile: string; area: string; preferredDropPointId: string }) => {
    if (isSupabaseConfigured && authUserId) {
      await leaderService.applyLeader(authUserId, appData);
      const dbLeader = await leaderService.getLeaderProfile(authUserId);
      setLeaderProfile(dbLeader);
      addNotification('Leader application submitted! Under review.', 'info');

      // Auto approve application after 6 seconds for nice demo transition
      setTimeout(async () => {
        const currentProfile = await leaderService.getLeaderProfile(authUserId);
        if (currentProfile.status === 'Pending') {
          await leaderService.approveLeader(authUserId);
          const approvedProfile = await leaderService.getLeaderProfile(authUserId);
          setLeaderProfile(approvedProfile);
        }
      }, 6000);
    } else {
      setLeaderProfile({
        ...leaderProfile,
        name: appData.name,
        mobile: appData.mobile,
        area: appData.area,
        preferredDropPointId: appData.preferredDropPointId,
        status: 'Pending',
        earnings: 0,
        balance: 0,
        todayOrders: 0,
        customers: 0,
        referralEarnings: 0
      });
      addNotification('Leader application submitted! Under review.', 'info');

      setTimeout(() => {
        setLeaderProfile(prev => {
          if (prev.status === 'Pending') {
            addNotification('Congratulations! Your Leader application has been approved!', 'success');
            return {
              ...prev,
              status: 'Active',
              earnings: 1240,
              balance: 540,
              todayOrders: 24,
              customers: 18,
              referralEarnings: 450
            };
          }
          return prev;
        });
      }, 6000);
    }
  };

  const approveLeaderApplication = async () => {
    if (isSupabaseConfigured && authUserId) {
      await leaderService.approveLeader(authUserId);
      const approvedProfile = await leaderService.getLeaderProfile(authUserId);
      setLeaderProfile(approvedProfile);
    } else {
      setLeaderProfile(prev => ({
        ...prev,
        status: 'Active',
        earnings: 1240,
        balance: 540,
        todayOrders: 24,
        customers: 18,
        referralEarnings: 450
      }));
      addNotification('Congratulations! Your Leader application has been approved!', 'success');
    }
  };

  const rejectLeaderApplication = async () => {
    if (isSupabaseConfigured && authUserId) {
      await leaderService.rejectLeader(authUserId);
      const dbLeader = await leaderService.getLeaderProfile(authUserId);
      setLeaderProfile(dbLeader);
    } else {
      setLeaderProfile(prev => ({
        ...prev,
        status: 'Rejected'
      }));
      addNotification('Your Leader application was rejected (Simulated). You can now re-apply.', 'error');
    }
  };

  const resetLeaderApplication = async () => {
    if (isSupabaseConfigured && authUserId) {
      await supabase.from('leader_applications').delete().eq('user_id', authUserId);
      await supabase.from('leaders').delete().eq('id', authUserId);
      const dbLeader = await leaderService.getLeaderProfile(authUserId);
      setLeaderProfile(dbLeader);
    } else {
      setLeaderProfile({
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
      });
      addNotification('Leader application state reset to Inactive.', 'info');
    }
  };

  const withdrawLeaderEarnings = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || amount > leaderProfile.balance) return false;

    if (isSupabaseConfigured && authUserId) {
      const success = await leaderService.withdrawFunds(authUserId, amount);
      if (success) {
        const dbLeader = await leaderService.getLeaderProfile(authUserId);
        setLeaderProfile(dbLeader);
        addNotification(`Withdrawal of ₹${amount} successful.`, 'success');
        return true;
      }
      return false;
    } else {
      setLeaderProfile(prev => ({
        ...prev,
        balance: prev.balance - amount
      }));
      addNotification(`Withdrawal of ₹${amount} successful.`, 'success');
      return true;
    }
  };

  // Referrals
  const claimReferralCode = async (code: string): Promise<boolean> => {
    const isHome123 = code.toUpperCase() === 'HOME123';
    let success = false;
    
    if (isSupabaseConfigured && authUserId) {
      success = await referralService.claimReferralCode(code, authUserId);
      if (success) {
        // Refresh User profile referrals count
        const dbProfile = await authService.getProfile(authUserId, user?.mobile || '');
        setUser(dbProfile);
      }
    }
    
    if (success || isHome123) {
      setAppliedPromoCode(code.toUpperCase());
      setPromoDiscount(100); // flat ₹100 promo code reward
      addNotification('Referral code successfully applied!', 'success');
      return true;
    }
    
    return false;
  };

  // Monthly Basket
  const addToMonthlyBasket = async (productId: string, quantity?: number) => {
    const qty = quantity || 1;
    if (isSupabaseConfigured && authUserId) {
      await monthlyBasketService.addToBasket(authUserId, productId, qty);
      const dbBasket = await monthlyBasketService.getBasket(authUserId);
      setMonthlyBasket(dbBasket);
    } else {
      setMonthlyBasket(prev => {
        const index = prev.findIndex(item => item.productId === productId);
        if (index > -1) {
          const copy = [...prev];
          copy[index].quantity += qty;
          return copy;
        }
        return [...prev, { productId, quantity: qty }];
      });
    }
    addNotification('Item added to your Monthly Basket.', 'success');
  };

  const removeFromMonthlyBasket = async (productId: string) => {
    if (isSupabaseConfigured && authUserId) {
      await monthlyBasketService.removeFromBasket(authUserId, productId);
      const dbBasket = await monthlyBasketService.getBasket(authUserId);
      setMonthlyBasket(dbBasket);
    } else {
      setMonthlyBasket(prev => prev.filter(item => item.productId !== productId));
    }
    addNotification('Item removed from your Monthly Basket.', 'info');
  };

  const updateMonthlyBasketQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromMonthlyBasket(productId);
      return;
    }

    if (isSupabaseConfigured && authUserId) {
      await monthlyBasketService.updateQuantity(authUserId, productId, quantity);
      const dbBasket = await monthlyBasketService.getBasket(authUserId);
      setMonthlyBasket(dbBasket);
    } else {
      setMonthlyBasket(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  // Notifications
  const markNotificationsAsRead = async () => {
    if (isSupabaseConfigured && authUserId) {
      await notificationService.markAsRead(authUserId);
      const dbNotifications = await notificationService.getNotifications(authUserId);
      setNotifications(dbNotifications);
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const addNotification = async (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (isSupabaseConfigured && authUserId) {
      await notificationService.addNotification(authUserId, message, type);
      const dbNotifications = await notificationService.getNotifications(authUserId);
      setNotifications(dbNotifications);
    } else {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        message,
        timestamp: 'Just now',
        type,
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Actions for Roles, Supplier Listing, Approvals, Dynamic Pricing & Refunds
  const addSupplierProduct = async (productData: Partial<Product>): Promise<Product> => {
    const newProduct: Product = {
      id: `prod-sup-${Date.now()}`,
      name: productData.name || 'New Supplier Product',
      description: productData.description || 'Quality product supplied by verified partner seller.',
      category: productData.category || 'Staples',
      originalPrice: Number(productData.originalPrice) || 500,
      groupPrice: Number(productData.groupPrice) || 350,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewsCount: 1,
      specifications: productData.specifications || { 'Company': productData.companyName || 'Supplier' },
      availability: 'in-stock',
      sellerRole: 'supplier',
      companyName: productData.companyName || 'Registered Supplier Co.',
      moq: Number(productData.moq) || 20,
      approvalStatus: 'pending', // Starts pending admin approval!
      submittedBy: user ? user.name : 'Supplier Partner',
      deliveryEstDate: '1 October to 7 October'
    };

    if (isSupabaseConfigured) {
      await productService.createProduct(newProduct);
    }

    setProducts(prev => [newProduct, ...prev]);
    await addNotification(`📋 Supplier Listing "${newProduct.name}" submitted! Pending Admin approval before appearing in Shop.`, 'info');
    return newProduct;
  };

  const addAdminProduct = async (productData: Partial<Product>): Promise<Product> => {
    const newProduct: Product = {
      id: `prod-adm-${Date.now()}`,
      name: productData.name || 'Admin Direct Item',
      description: productData.description || 'Directly published item by HomeKart Admin.',
      category: productData.category || 'Staples',
      originalPrice: Number(productData.originalPrice) || 500,
      groupPrice: Number(productData.groupPrice) || 350,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 10,
      specifications: productData.specifications || { 'Seller': 'HomeKart Admin Direct' },
      availability: 'in-stock',
      sellerRole: 'admin',
      companyName: 'HomeKart Direct',
      moq: Number(productData.moq) || 10,
      approvalStatus: 'approved',
      submittedBy: 'Admin',
      deliveryEstDate: '1 October to 7 October'
    };

    if (isSupabaseConfigured) {
      await productService.createProduct(newProduct);
    }

    setProducts(prev => [newProduct, ...prev]);

    // Create an initial group for the direct admin product
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      productImage: newProduct.imageUrl,
      groupPrice: newProduct.groupPrice,
      originalPrice: newProduct.originalPrice,
      savings: newProduct.originalPrice - newProduct.groupPrice,
      currentMembers: 1,
      targetMembers: newProduct.moq || 5,
      memberNames: ['HomeKart Community'],
      status: 'Open',
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      dropPointId: selectedDropPoint.id,
      dropPointName: selectedDropPoint.name,
      moq: newProduct.moq,
      companyName: newProduct.companyName
    };
    setGroups(prev => [newGroup, ...prev]);

    await addNotification(`✨ Product "${newProduct.name}" directly published to Shop!`, 'success');
    return newProduct;
  };

  const approveProduct = async (productId: string) => {
    let approvedProd: Product | null = null;
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        approvedProd = { ...p, approvalStatus: 'approved' };
        return approvedProd;
      }
      return p;
    }));

    const targetProd = approvedProd || products.find(p => p.id === productId);
    if (targetProd) {
      // Auto-create a buying group for the newly approved product if none exists
      const existingGrp = groups.find(g => g.productId === productId);
      if (!existingGrp) {
        const newGroup: Group = {
          id: `grp-${Date.now()}`,
          productId: targetProd.id,
          productName: targetProd.name,
          productImage: targetProd.imageUrl,
          groupPrice: targetProd.groupPrice,
          originalPrice: targetProd.originalPrice,
          savings: targetProd.originalPrice - targetProd.groupPrice,
          currentMembers: 1,
          targetMembers: targetProd.moq || 5,
          memberNames: [targetProd.companyName || targetProd.submittedBy || 'Verified Supplier'],
          status: 'Open',
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          dropPointId: selectedDropPoint.id,
          dropPointName: selectedDropPoint.name,
          moq: targetProd.moq,
          companyName: targetProd.companyName
        };
        setGroups(prev => [newGroup, ...prev]);
      }
      await addNotification(`🎉 Product "${targetProd.name}" has been APPROVED by Admin and is live for Buyers!`, 'success');
    }
  };

  const rejectProduct = async (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, approvalStatus: 'rejected' } : p));
    const targetProd = products.find(p => p.id === productId);
    await addNotification(`Product "${targetProd?.name || 'Item'}" rejected by Admin.`, 'warning');
  };

  const addCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      await addNotification(`New category "${trimmed}" added successfully by Admin!`, 'success');
    }
  };

  const updateGroupPriceByAdmin = async (productId: string, newGroupPrice: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, groupPrice: newGroupPrice } : p));

    setGroups(prev => prev.map(g => {
      if (g.productId === productId) {
        const newSavings = g.originalPrice - newGroupPrice;
        return { ...g, groupPrice: newGroupPrice, savings: newSavings, adminPriceModified: true };
      }
      return g;
    }));

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          product: { ...item.product, groupPrice: newGroupPrice }
        };
      }
      return item;
    }));

    const prod = products.find(p => p.id === productId);
    await addNotification(`⚡ Price Override Applied! Group price for "${prod?.name || 'Product'}" reduced to ₹${newGroupPrice}.`, 'success');
  };

  const processGroupRefund = async (groupId: string, reason?: string) => {
    const group = groups.find(g => g.id === groupId);
    const refundReasonText = reason || 'Group MOQ target not filled within delivery launch period.';

    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, status: 'Cancelled' } : g));

    setOrders(prev => prev.map(ord => {
      const containsProduct = group && ord.items.some(i => i.productId === group.productId);
      if (ord.groupId === groupId || containsProduct) {
        return {
          ...ord,
          groupStatus: 'Cancelled',
          paymentStatus: 'Refunded',
          refundDetails: {
            amount: ord.total,
            date: new Date().toISOString(),
            reason: refundReasonText,
            transactionId: `REF-${Math.floor(100000 + Math.random() * 900000)}`
          }
        };
      }
      return ord;
    }));

    await addNotification(`💸 Money Refund Initiated for "${group?.productName || 'Order'}". Amount returned to buyers.`, 'warning');
  };

  return (
    <HomekartContext.Provider value={{
      activePage,
      pageParams,
      setPage,
      userRole,
      setUserRole,
      kycApplications,
      submitSellerKyc,
      approveSellerKyc,
      rejectSellerKyc,
      loginWithPhonePassword,
      loginAdmin,
      registerUser,
      updateUserInterestedCategories,
      categories,
      addCategory,
      addSupplierProduct,
      addAdminProduct,
      approveProduct,
      rejectProduct,
      updateGroupPriceByAdmin,
      processGroupRefund,
      searchQuery,
      setSearchQuery: handleSetSearchQuery,
      selectedCategory,
      setSelectedCategory: handleSetSelectedCategory,
      user,
      login,
      verifyOtp,
      logout,
      products,
      groups,
      dropPoints,
      selectedDropPoint,
      setSelectedDropPoint,
      isLoading,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      placeOrder,
      cancelOrder,
      completeOrder,
      joinGroupDirectly,
      createGroupForProduct,
      simulateFriendJoin,
      leaderProfile,
      submitLeaderApplication,
      approveLeaderApplication,
      rejectLeaderApplication,
      resetLeaderApplication,
      withdrawLeaderEarnings,
      claimReferralCode,
      promoDiscount,
      appliedPromoCode,
      monthlyBasket,
      addToMonthlyBasket,
      removeFromMonthlyBasket,
      updateMonthlyBasketQuantity,
      notifications,
      markNotificationsAsRead,
      addNotification,
      updateProfile
    }}>
      {children}
    </HomekartContext.Provider>
  );
};

export const useHomekart = () => {
  const context = useContext(HomekartContext);
  if (context === undefined) {
    throw new Error('useHomekart must be used within a HomekartProvider');
  }
  return context;
};
