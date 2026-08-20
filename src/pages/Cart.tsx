import React from 'react';
import { useHomekart } from '../store/homekartStore';
import { calculateDynamicPrice } from '../utils/pricing';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  ShoppingBag, 
  Trash2, 
  MapPin, 
  Percent, 
  ChevronRight 
} from 'lucide-react';

export const Cart: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    selectedDropPoint,
    setPage,
    groups,
    isLoading
  } = useHomekart();

  const handleQtyChange = (productId: string, quantity: number, isGroupBuy: boolean, groupId?: string) => {
    updateCartQuantity(productId, quantity, isGroupBuy, groupId);
  };

  const handleRemove = (productId: string, isGroupBuy: boolean, groupId?: string) => {
    removeFromCart(productId, isGroupBuy, groupId);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
  const total = cart.reduce((sum, item) => {
    const price = calculateDynamicPrice(item.product, item.isGroupBuy, item.groupId, groups);
    return sum + (price * item.quantity);
  }, 0);
  const savings = subtotal - total;
  const applicableCharges = 0; // Free Pickup

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--color-green-light)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px auto'
        }} />
        <p style={{ color: '#5C6C62' }}>Loading cart...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }} className="animate-fade-in">
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-green-very-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          <ShoppingBag size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#5C6C62', maxWidth: '360px', margin: '0 auto' }}>
            Looks like you haven't joined any buying groups yet. Start saving together now!
          </p>
        </div>
        <Button onClick={() => setPage('shop')} size="lg">
          START SHOPPING
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Shopping Cart
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Review your items, quantities, and active drop point for pickup.
        </p>
      </div>

      {/* Cart Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '32px',
        alignItems: 'start'
      }} className="cart-grid-responsive">
        
        {/* Left Column: Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map(item => {
            const dynamicUnitPrice = calculateDynamicPrice(item.product, item.isGroupBuy, item.groupId, groups);
            const itemOriginalTotal = item.product.originalPrice * item.quantity;
            const itemTotal = dynamicUnitPrice * item.quantity;
            const itemSavings = itemOriginalTotal - itemTotal;

            return (
              <div 
                key={`${item.product.id}-${item.isGroupBuy ? 'group' : 'alone'}-${item.groupId || ''}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  gap: '20px',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)'
                }}
                className="cart-item"
              >
                {/* Product Image */}
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    border: '1px solid var(--color-border)'
                  }}
                />

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-ui)', color: 'var(--color-dark)' }}>
                        {item.product.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#5C6C62', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Category: {item.product.category}
                      </span>
                    </div>
                  </div>

                  {/* Quantity adjustment & buying type */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    
                    {/* Qty Selector */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-white)'
                    }}>
                      <button 
                        onClick={() => handleQtyChange(item.product.id, item.quantity - 1, item.isGroupBuy, item.groupId)}
                        style={{ padding: '4px 10px', borderRight: '1px solid var(--color-border)', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ padding: '4px 12px', minWidth: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQtyChange(item.product.id, item.quantity + 1, item.isGroupBuy, item.groupId)}
                        style={{ padding: '4px 10px', borderLeft: '1px solid var(--color-border)', fontWeight: 'bold' }}
                      >+</button>
                    </div>

                    {/* Group Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge status={item.isGroupBuy ? 'GROUP BUY' : 'BUY ALONE'} />
                      {item.isGroupBuy && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-green-bright)', fontWeight: 700 }}>
                          Save ₹{itemSavings}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Delete Panel */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-between',
                  minWidth: '90px'
                }}>
                  <button 
                    onClick={() => handleRemove(item.product.id, item.isGroupBuy, item.groupId)}
                    style={{ color: '#8C9B90', cursor: 'pointer' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div style={{ textAlign: 'right' }}>
                    {item.isGroupBuy && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', fontSize: '0.8rem', display: 'block' }}>
                        ₹{itemOriginalTotal}
                      </span>
                    )}
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₹{itemTotal}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Column: Pricing Summary & Drop Point */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Drop Point selection */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--color-primary)' }} /> Select Drop Point
            </h3>
            <div style={{
              backgroundColor: 'var(--color-green-very-light)',
              border: '1px solid rgba(24, 83, 56, 0.1)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{selectedDropPoint.name}</p>
                <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{selectedDropPoint.distance} away</span>
              </div>
              <button 
                onClick={() => setPage('dropPoints')}
                style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                Change <ChevronRight size={14} />
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#5C6C62', lineHeight: '1.4' }}>
              Collective drop-off saves courier logistics costs. You pick up directly from this location.
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-green-bright)', marginTop: '4px' }}>
              Expected Delivery: In 2 days
            </p>
          </div>

          {/* Pricing summary */}
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
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#5C6C62' }}>
                <span>Subtotal (Items Normal Price)</span>
                <span>₹{subtotal}</span>
              </div>
              
              {savings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Percent size={14} /> Group Savings Discount
                  </span>
                  <span>-₹{savings}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#5C6C62' }}>
                <span>Pickup Fee (Applicable charges)</span>
                <span style={{ color: 'var(--color-green-bright)', fontWeight: 600 }}>+₹{applicableCharges} (FREE)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 0' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Amount</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                ₹{total}
              </span>
            </div>

            <Button 
              onClick={() => setPage('checkout')}
              fullWidth={true}
              size="lg"
            >
              CONTINUE TO PAYMENT <ChevronRight size={16} style={{ marginLeft: '6px' }} />
            </Button>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Cart;
