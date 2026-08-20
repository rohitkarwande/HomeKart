import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { calculateDynamicPrice } from '../utils/pricing';
import { Button } from '../components/common/Button';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Percent
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const {
    cart,
    selectedDropPoint,
    setPage,
    claimReferralCode,
    promoDiscount,
    appliedPromoCode,
    groups
  } = useHomekart();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cop'>('upi');
  const [promoCode, setPromoCode] = useState(appliedPromoCode || '');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  const promoApplied = !!appliedPromoCode;

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>No items to checkout</h2>
        <Button onClick={() => setPage('shop')} style={{ marginTop: '16px' }}>Go Shop</Button>
      </div>
    );
  }

  // Cost calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = calculateDynamicPrice(item.product, item.isGroupBuy, item.groupId, groups);
    return sum + (price * item.quantity);
  }, 0);
  const groupSavings = subtotal - cartTotal;
  const applicableCharges = 0; // Free Pickup
  const netTotal = Math.max(0, subtotal - groupSavings + applicableCharges - promoDiscount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    
    const valid = await claimReferralCode(promoCode);
    if (!valid) {
      alert('Invalid promo or referral code. Try "HOME123".');
    }
  };

  const handlePayAndConfirm = () => {
    setPage('payment', { method: paymentMethod, upiApp });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }} className="animate-fade-in">
      
      {/* Back Link */}
      <div>
        <button 
          onClick={() => setPage('cart')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Return to Cart
        </button>
      </div>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Secure Checkout
        </h1>
        <p style={{ color: '#5C6C62' }}>Complete your purchase. Savings are locked immediately.</p>
      </div>

      {/* Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '32px',
        alignItems: 'start'
      }} className="checkout-grid-responsive">
        
        {/* Left Column: Delivery address & Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pickup Address Confirmation */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--color-primary)' }} /> Neighborhood Pickup Location
            </h3>
            
            <div style={{
              backgroundColor: 'var(--color-green-very-light)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(24, 83, 56, 0.1)',
              fontSize: '0.9rem'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '4px' }}>
                {selectedDropPoint.name}
              </p>
              <p style={{ color: 'var(--color-dark)', lineHeight: '1.5', marginBottom: '8px' }}>
                {selectedDropPoint.address}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>
                Expected Delivery: <strong>In 2 days</strong>
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} style={{ color: 'var(--color-primary)' }} /> Choose Payment Mode
            </h3>

            {/* UPI Option */}
            <div 
              onClick={() => setPaymentMethod('upi')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: paymentMethod === 'upi' ? 'var(--color-green-very-light)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'upi'} 
                onChange={() => setPaymentMethod('upi')}
                style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-dark)' }}>
                  Pay via Instant UPI (UPI Apps)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>
                  Secure instant payment. Refunds are immediately sent to the same UPI handle if the group is cancelled.
                </span>

                {/* Sub UPI apps select */}
                {paymentMethod === 'upi' && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '12px',
                    borderTop: '1px solid rgba(24,83,56,0.1)',
                    paddingTop: '12px'
                  }}>
                    {['gpay', 'phonepe', 'paytm'].map((app: any) => (
                      <button
                        key={app}
                        onClick={(e) => { e.stopPropagation(); setUpiApp(app); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${upiApp === app ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          backgroundColor: upiApp === app ? 'var(--color-white)' : 'transparent',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)'
                        }}
                      >
                        {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cash on Pickup Option */}
            <div 
              onClick={() => setPaymentMethod('cop')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${paymentMethod === 'cop' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: paymentMethod === 'cop' ? 'var(--color-green-very-light)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'cop'} 
                onChange={() => setPaymentMethod('cop')}
                style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-dark)' }}>
                  Cash on Pickup (COP)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>
                  Pay in cash directly to your neighborhood Leader when collecting your package.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Promos and Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Promo code form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={18} style={{ color: 'var(--color-primary)' }} /> Have a Referral Code?
            </h3>
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter Referral Code (e.g. HOME123)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Button type="submit" disabled={promoApplied} variant="secondary" size="sm">
                {promoApplied ? 'Applied' : 'Apply'}
              </Button>
            </form>
            {promoApplied && (
              <p style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>
                ✓ Promo code applied! Saved ₹100 on order.
              </p>
            )}
          </div>

          {/* Checkout Totals */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>Summary</h3>

            {/* Items display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '16px'
            }}>
              {cart.map(item => (
                <div key={`${item.product.id}-${item.isGroupBuy ? 'group' : 'alone'}-${item.groupId || ''}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-dark)', fontWeight: 600 }}>
                    {item.product.name} (x{item.quantity})
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    ₹{calculateDynamicPrice(item.product, item.isGroupBuy, item.groupId, groups) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotals list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5C6C62' }}>
                <span>Subtotal (Normal Price)</span>
                <span>₹{subtotal}</span>
              </div>
              {groupSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 600 }}>
                  <span>Group Buying Discount</span>
                  <span>-₹{groupSavings}</span>
                </div>
              )}
              {promoApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 600 }}>
                  <span>Referral Bonus Applied</span>
                  <span>-₹{promoDiscount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5C6C62' }}>
                <span>Pickup Fee (Applicable charges)</span>
                <span style={{ color: 'var(--color-green-bright)', fontWeight: 600 }}>+₹{applicableCharges} (FREE)</span>
              </div>
            </div>

            {/* Net Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 0' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>Total Payable</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                ₹{netTotal}
              </span>
            </div>

            <Button 
              onClick={handlePayAndConfirm}
              fullWidth={true}
              size="lg"
            >
              PAY & PLACE ORDER
            </Button>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default Checkout;
