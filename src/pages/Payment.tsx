import React, { useEffect, useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';

export const Payment: React.FC = () => {
  const { cart, placeOrder, setPage, pageParams } = useHomekart();
  const [error, setError] = useState<string | null>(null);

  const paymentMethod = pageParams?.method || 'upi';
  const upiApp = pageParams?.upiApp || 'gpay';

  useEffect(() => {
    // If cart is empty, redirect to shop
    if (cart.length === 0) {
      const timer = setTimeout(() => {
        setPage('shop');
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      try {
        const orderMethod = paymentMethod === 'upi' 
          ? `UPI (${upiApp.toUpperCase()})` 
          : 'Cash on Pickup';
          
        const newOrder = await placeOrder(orderMethod);
        
        if (newOrder) {
          setPage('orderSuccess', { orderId: newOrder.id });
        } else {
          setError('Failed to create order. Please try again.');
        }
      } catch (err: any) {
        console.error('Payment processing error:', err);
        setError('An unexpected error occurred during payment.');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [cart, paymentMethod, upiApp]);

  if (cart.length === 0 && !error) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>No pending payment sessions. Redirecting...</h2>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-dark)',
      gap: '24px',
      minHeight: '60vh',
      maxWidth: '480px',
      margin: '0 auto',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      padding: '32px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-md)'
    }} className="animate-fade-in">
      {error ? (
        <>
          <h2 style={{ color: 'var(--color-error)' }}>Payment Failed</h2>
          <p style={{ color: '#5C6C62' }}>{error}</p>
          <Button onClick={() => setPage('cart')} style={{ marginTop: '16px' }}>Return to Cart</Button>
        </>
      ) : (
        <>
          {/* Circular Spinner */}
          <div style={{
            width: '64px',
            height: '64px',
            border: '6px solid var(--color-green-light)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite'
          }} />
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
            Processing Secure Payment...
          </h2>
          <p style={{ color: '#5C6C62', fontSize: '0.9rem' }}>
            {paymentMethod === 'upi' 
              ? `Communicating with ${upiApp === 'gpay' ? 'Google Pay' : upiApp === 'phonepe' ? 'PhonePe' : 'Paytm'} UPI client.` 
              : 'Verifying Cash on Pickup details.'}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#8C9B90' }}>
            Please do not close this window or click refresh.
          </span>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Payment;
