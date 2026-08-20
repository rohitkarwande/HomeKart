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
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // Relative string like "10 minutes ago"
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface UserProfile {
  name: string;
  mobile: string;
  referralCode: string;
  referralEarnings: number;
  referralsCount: number;
  referralHistory: { name: string; date: string; amount: number }[];
}

export interface MonthlyBasketItem {
  productId: string;
  quantity: number;
}
