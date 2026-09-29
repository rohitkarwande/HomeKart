export type UserRole = 'buyer' | 'supplier' | 'admin';

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  originalPrice: number;
  groupPrice: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  specifications: { [key: string]: string };
  availability: 'in-stock' | 'out-of-stock';
  expiresAt?: string;
  // Real-world Multi-user & Supplier extensions
  sellerRole?: 'admin' | 'supplier';
  companyName?: string;
  moq?: number; // Minimum Order Quantity / Target for group fill
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  submittedBy?: string;
  deliveryEstDate?: string; // Delivery window, e.g., "1 October to 7 October"
}

export type GroupStatusType =
  | 'Open'
  | 'Joining'
  | 'Almost Full'
  | 'Confirmed'
  | 'Supplier Confirmed'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled'
  | 'Refund Initiated'
  | 'Refunded';

export interface Group {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  groupPrice: number;
  originalPrice: number;
  savings: number;
  currentMembers: number;
  targetMembers: number;
  memberNames: string[];
  status: GroupStatusType;
  deadline: string; // ISO date string
  dropPointId: string;
  dropPointName: string;
  moq?: number;
  companyName?: string;
  adminPriceModified?: boolean;
}

export interface DropPoint {
  id: string;
  name: string;
  area: string;
  distance: string;
  address: string;
  phone: string;
}

export interface LeaderProfile {
  name: string;
  mobile: string;
  area: string;
  preferredDropPointId: string;
  status: 'Inactive' | 'Pending' | 'Under Review' | 'Active' | 'Rejected';
  earnings: number;
  balance: number;
  todayOrders: number;
  customers: number;
  referralEarnings: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  originalPrice: number;
  groupPrice: number;
  isGroupBuy: boolean;
  companyName?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  savings: number;
  total: number;
  paymentStatus: 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Refund Initiated' | 'Refunded';
  groupStatus: GroupStatusType | 'N/A'; // N/A if bought alone
  dropPoint: DropPoint;
  pickupStatus: 'Pending' | 'Ready for Pickup' | 'Picked Up';
  date: string; // ISO string
  groupId?: string; // empty if buy alone
  timeline: { title: string; date: string; completed: boolean }[];
  deliveryEstDate?: string; // Estimated delivery date range: e.g. "1 October to 7 October"
  refundDetails?: {
    amount: number;
    date: string;
    reason: string;
    transactionId: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // Relative string like "10 minutes ago"
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface SellerKycApplication {
  id: string;
  userId: string;
  applicantName: string;
  phone: string;
  companyName: string;
  gstin: string;
  panNumber: string;
  businessAddress: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  submittedAt: string;
  status: KycStatus;
  rejectionReason?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  referralCode: string;
  referralEarnings: number;
  referralsCount: number;
  referralHistory: { name: string; date: string; amount: number }[];
  role?: UserRole;
  kycStatus?: KycStatus;
  kycApplication?: SellerKycApplication;
  interestedCategories?: string[];
}

export interface MonthlyBasketItem {
  productId: string;
  quantity: number;
}


