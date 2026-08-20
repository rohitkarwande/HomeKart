import React from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { ShoppingBasket, Trash2, ChevronRight, Plus, Check } from 'lucide-react';

export const MonthlyBasket: React.FC = () => {
  const {
    monthlyBasket,
    products,
    updateMonthlyBasketQuantity,
    removeFromMonthlyBasket,
    addToMonthlyBasket,
    addToCart,
    setPage,
    addNotification,
    isLoading
  } = useHomekart();

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
        <p style={{ color: '#5C6C62' }}>Loading basket...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Map basket items to actual product details
  const basketItems = monthlyBasket.map(item => {
    const prod = products.find(p => p.id === item.productId);
    return prod ? { product: prod, quantity: item.quantity } : null;
  }).filter(Boolean) as { product: any; quantity: number }[];

  // Recommended essentials to add to basket
  const recommendedStaples = products.filter(p => p.category === 'Groceries').slice(0, 3);

  const handleAddAllToCart = () => {
    if (basketItems.length === 0) return;
    
    // Add all basket items to shopping cart as group buys by default to save!
    basketItems.forEach(item => {
      addToCart(item.product, item.quantity, true);
    });

    addNotification('All monthly basket items added to cart at group prices!', 'success');
    setPage('cart');
  };

  const handleToggleBasketItem = (productId: string) => {
    const exists = monthlyBasket.some(item => item.productId === productId);
    if (exists) {
      removeFromMonthlyBasket(productId);
    } else {
      addToMonthlyBasket(productId, 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          My Monthly Basket
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Set up a quick template of frequently-ordered staples. Add all to cart in one click whenever you need them.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '32px',
        alignItems: 'start'
      }} className="basket-grid-responsive">
        
        {/* Left Column: Basket Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {basketItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {basketItems.map(item => {
                return (
                  <div
                    key={item.product.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                          {item.product.name}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>
                          ₹{item.product.groupPrice} group price
                        </span>
                      </div>
                    </div>

                    {/* Quantity selectors */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-white)'
                      }}>
                        <button 
                          onClick={() => updateMonthlyBasketQuantity(item.product.id, item.quantity - 1)}
                          style={{ padding: '4px 8px', fontWeight: 'bold' }}
                        >-</button>
                        <span style={{ padding: '4px 12px', minWidth: '32px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateMonthlyBasketQuantity(item.product.id, item.quantity + 1)}
                          style={{ padding: '4px 8px', fontWeight: 'bold' }}
                        >+</button>
                      </div>

                      <button 
                        onClick={() => removeFromMonthlyBasket(item.product.id)}
                        style={{ color: '#8C9B90', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}

              {/* Add all to cart trigger */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button onClick={handleAddAllToCart} size="lg">
                  ADD BASKET TO CART <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                </Button>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '64px 32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-green-very-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <ShoppingBasket size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Your Monthly Basket is empty</h3>
                <p style={{ color: '#5C6C62', maxWidth: '340px', margin: '0 auto' }}>
                  Add products you buy regularly so you can re-order them in seconds next time.
                </p>
              </div>
              <Button onClick={() => setPage('shop')}>Browse Products</Button>
            </div>
          )}
        </div>

        {/* Right Column: Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
              Add Daily Essentials
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#5C6C62', lineHeight: '1.4' }}>
              Add these standard daily products to your monthly basket:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendedStaples.map(prod => {
                const isInBasket = monthlyBasket.some(item => item.productId === prod.id);

                return (
                  <div 
                    key={prod.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-off-white)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                          ₹{prod.groupPrice} / unit
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBasketItem(prod.id)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isInBasket ? 'var(--color-primary)' : 'transparent',
                        border: `1px solid ${isInBasket ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: isInBasket ? '#FFFFFF' : 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isInBasket ? <Check size={14} /> : <Plus size={14} />}
                    </button>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .basket-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
export default MonthlyBasket;
