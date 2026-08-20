import React, { useEffect } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { CheckCircle } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { setPage, pageParams } = useHomekart();
  const orderId = pageParams?.orderId || '';

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage('orders', orderId ? { id: orderId } : undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [orderId]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--color-primary)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      gap: '24px',
      padding: '24px'
    }} className="animate-fade-in">
      <CheckCircle size={80} style={{ color: 'var(--color-accent)' }} />
      <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontFamily: 'var(--font-display)', margin: 0 }}>
        Payment Successful!
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '380px', textAlign: 'center', margin: 0 }}>
        {orderId ? `Your order #${orderId} has been placed successfully.` : 'Your order has been placed successfully.'}{' '}
        Group-buying status has been updated.
      </p>
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
        Redirecting you to My Orders page...
      </span>
      <Button 
        onClick={() => setPage('orders')} 
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-dark)',
          border: 'none',
          marginTop: '16px'
        }}
      >
        GO TO MY ORDERS
      </Button>
    </div>
  );
};

export default OrderSuccess;
