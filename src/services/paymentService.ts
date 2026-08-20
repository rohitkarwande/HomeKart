import { isSupabaseConfigured } from './supabaseClient';

export const paymentService = {
  async processPayment(paymentMethod: string, amount: number): Promise<{ success: boolean; transactionId: string | null }> {
    console.log(`Processing simulated payment of ₹${amount} via ${paymentMethod}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (isSupabaseConfigured) {
      // Return simulated success transaction keys
      const mockTxId = `txn_${Math.random().toString(36).substr(2, 9)}`;
      return { success: true, transactionId: mockTxId };
    }

    return { success: true, transactionId: 'MOCK_TXN_1234' };
  }
};
