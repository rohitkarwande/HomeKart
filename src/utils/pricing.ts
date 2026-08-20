import type { Product, Group } from '../types';

/**
 * Calculates the dynamic group price based on current group fill count.
 * Decreases linearly from originalPrice to groupPrice as member count rises.
 */
export const calculateDynamicPrice = (
  product: Product,
  isGroupBuy: boolean,
  groupId?: string,
  groups: Group[] = []
): number => {
  if (!isGroupBuy) return product.originalPrice;

  let current = 1;
  let target = 5;

  if (groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      current = group.currentMembers;
      target = group.targetMembers;
    }
  }

  const maxDiscount = product.originalPrice - product.groupPrice;
  if (target <= 0) return product.groupPrice;
  
  const discountRatio = Math.min(1, current / target);
  const dynamicDiscount = Math.round(maxDiscount * discountRatio);
  return product.originalPrice - dynamicDiscount;
};

/**
 * Calculates human-readable countdown text for deal expiry.
 */
export const getCountdownText = (expiresAtStr?: string): string => {
  if (!expiresAtStr) return 'Limited Time Offer';
  const expiresAt = new Date(expiresAtStr);
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  if (diff <= 0) return 'Deal Closed';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `Ends in ${hours}h ${minutes}m`;
  }
  return `Ends in ${minutes}m`;
};

/**
 * Formats the exact date and time when the deal expires.
 */
export const formatExpiryTime = (expiresAtStr?: string): string => {
  if (!expiresAtStr) return '';
  const date = new Date(expiresAtStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
