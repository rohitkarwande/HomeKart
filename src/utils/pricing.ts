import type { Product, Group } from '../types';

/**
 * Checks if the user is the first member (creator or 1st entrant) of a buying group.
 */
export const isFirstGroupMember = (groupId?: string, groups: Group[] = []): boolean => {
  if (!groupId) return true; // Starting a brand new group
  const group = groups.find(g => g.id === groupId);
  if (!group) return true;
  return group.currentMembers <= 1;
};

/**
 * Calculates the extra 10% bonus discount per unit for the first member if quantity >= 5.
 */
export const calculateFirstUserBonus = (
  product: Product,
  isGroupBuy: boolean,
  quantity: number,
  isFirstUser: boolean
): number => {
  if (isGroupBuy && isFirstUser && quantity >= 5) {
    return Math.round(product.groupPrice * 0.10); // 10% extra discount off group price
  }
  return 0;
};

/**
 * Calculates the dynamic group price based on current group fill count and first-member bulk bonus.
 */
export const calculateDynamicPrice = (
  product: Product,
  isGroupBuy: boolean,
  groupId?: string,
  groups: Group[] = [],
  quantity: number = 1
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
  const targetVal = target <= 0 ? 1 : target;
  const discountRatio = Math.min(1, current / targetVal);
  const dynamicDiscount = Math.round(maxDiscount * discountRatio);
  let price = product.originalPrice - dynamicDiscount;

  const isFirstUser = isFirstGroupMember(groupId, groups);
  const bonus = calculateFirstUserBonus(product, isGroupBuy, quantity, isFirstUser);
  price = Math.max(1, price - bonus);

  return price;
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
