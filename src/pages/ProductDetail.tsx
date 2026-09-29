import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  ArrowLeft, 
  Star, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Share2,
  Truck,
  Clock
} from 'lucide-react';
import { getCountdownText, formatExpiryTime, calculateFirstUserBonus } from '../utils/pricing';

const getGalleryImages = (mainUrl: string): string[] => {
  if (mainUrl.includes('unsplash.com')) {
    const match = mainUrl.match(/\/photo-([a-zA-Z0-9-]+)/);
    if (match) {
      const photoId = match[1];
      const galleryMap: { [id: string]: string[] } = {
        // Headphones
        '1505740420928-5e560c06d30e': [
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80'
        ],
        // Smart Fitness Watch
        '1523275335684-37898b6baf30': [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&auto=format&fit=crop&q=80'
        ],
        // Earbuds
        '1590658268037-6bf12165a8df': [
          'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80'
        ],
        // Apples
        '1560806887-1e4cd0b6cbd6': [
          'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format&fit=crop&q=80'
        ],
        // Tomatoes
        '1518977676601-b53f82aba655': [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80'
        ],
        // Basmati Rice
        '1586201375761-83865001e31c': [
          'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80'
        ],
        // Ghee
        '1626132647523-66f5bf380027': [
          'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&auto=format&fit=crop&q=80'
        ],
        // Chair
        '1580481072645-022f9a6dbf27': [
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=80'
        ],
        // Pillow
        '1631679706909-1844bbd07221': [
          'https://images.unsplash.com/photo-1616627547271-92523ad63a6a?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=500&auto=format&fit=crop&q=80'
        ]
      };
      if (galleryMap[photoId]) {
        return [mainUrl, ...galleryMap[photoId]];
      }
    }
  }
  return [mainUrl, mainUrl + '&sig=1', mainUrl + '&sig=2'];
};

export const ProductDetail: React.FC = () => {
  const { 
    pageParams, 
    setPage, 
    products, 
    groups, 
    addToCart, 
    selectedDropPoint,
    addNotification,
    addToMonthlyBasket,
    isLoading
  } = useHomekart();

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'desc' | 'specs'>('desc');

  const productId = pageParams.id;
  const product = products.find(p => p.id === productId);

  const galleryImages = product ? getGalleryImages(product.imageUrl) : [];
  const [activeImage, setActiveImage] = useState(product ? product.imageUrl : '');

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  if (!product) {
    if (isLoading || products.length === 0) {
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
          <p style={{ color: '#5C6C62' }}>Loading product details...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Button onClick={() => setPage('shop')} style={{ marginTop: '16px' }}>Back to Shop</Button>
      </div>
    );
  }

  // Find active groups for this specific product
  const isExpired = product.expiresAt ? (new Date() > new Date(product.expiresAt)) : false;
  const activeProductGroups = isExpired ? [] : groups.filter(g => g.productId === product.id && (g.status === 'Open' || g.status === 'Almost Full'));

  const savings = (product.originalPrice - product.groupPrice) * quantity;

  const handleBuyAlone = () => {
    if (isExpired) return;
    addToCart(product, quantity, false);
    setPage('cart');
  };

  const handleJoinNewGroup = () => {
    if (isExpired) return;
    // isGroupBuy = true, no groupId means start a new group
    addToCart(product, quantity, true);
    setPage('cart');
  };

  const handleJoinExistingGroup = (groupId: string) => {
    if (isExpired) return;
    addToCart(product, quantity, true, groupId);
    setPage('cart');
  };

  const handleShare = () => {
    // Copy a dummy invite link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/?product=${product.id}`);
    addNotification('Invite link copied to clipboard! Share it with neighbors.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Back link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => setPage('shop')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        {product.approvalStatus === 'pending' && (
          <Badge status="Pending Admin Approval" />
        )}
      </div>

      {/* Pending status alert banner if item is waiting for admin approval */}
      {product.approvalStatus === 'pending' && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#92400E',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⏳ <strong>Pending Admin Approval:</strong> This seller listing is currently under review by Admin before appearing to public buyers in the market.</span>
        </div>
      )}

      {/* Main product layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Left Column: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '100%',
            height: '380px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-gray-light)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)'
          }}>
            <img 
              src={activeImage} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          {/* Thumbnails row */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                style={{
                  width: '64px',
                  height: '64px',
                  padding: 0,
                  borderRadius: 'var(--radius-sm)',
                  border: activeImage === img ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-gray-light)'
                }}
              >
                <img src={img} alt={`view-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-primary)'
              }}
            >
              <Share2 size={14} /> Invite Neighbors
            </button>
          </div>
        </div>

        {/* Right Column: Pricing details, descriptions, buying actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <Badge status={product.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'} />
              <span style={{
                backgroundColor: 'var(--color-green-very-light)',
                color: 'var(--color-primary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(24, 83, 56, 0.15)'
              }}>
                Seller: {product.companyName || 'HomeKart Direct'}
              </span>
              <span style={{
                backgroundColor: 'rgba(230, 150, 0, 0.1)',
                color: '#B45309',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                MOQ Target: {product.moq || 20} Units
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-dark)', marginTop: '8px', lineHeight: '1.25' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {product.rating} <Star size={12} fill="#FFFFFF" stroke="#FFFFFF" />
              </span>
              <span style={{ fontSize: '0.85rem', color: '#5C6C62' }}>
                ({product.reviewsCount} customer reviews)
              </span>
            </div>

            {/* Estimated Delivery Box */}
            <div style={{
              marginTop: '14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Truck size={22} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated Order Delivery
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  📅 {product.deliveryEstDate || '1 October to 7 October'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Delivering within a week after group deal launch.
                </div>
              </div>
            </div>

            {product.expiresAt && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '4px', 
                marginTop: '12px',
                fontSize: '0.9rem',
                color: isExpired ? 'var(--color-error)' : 'var(--color-primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <Clock size={16} /> <span>{getCountdownText(product.expiresAt)}</span>
                </div>
                {!isExpired && (
                  <span style={{ fontSize: '0.8rem', color: '#5C6C62', marginLeft: '22px' }}>
                    Offer ends on: <strong>{formatExpiryTime(product.expiresAt)}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* First Member Discount Incentive Banner */}
          {(() => {
            const firstBonusPerUnit = calculateFirstUserBonus(product, true, quantity, true);
            const effectivePrice = product.groupPrice - firstBonusPerUnit;
            const isEligible = quantity >= 5;

            return (
              <div style={{
                backgroundColor: isEligible ? '#ECFDF5' : '#EFF6FF',
                border: isEligible ? '1px solid #10B981' : '1px solid #3B82F6',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: isEligible ? '#047857' : '#1D4ED8', fontSize: '0.9rem' }}>
                  <span>👑 FIRST MEMBER BONUS DEAL:</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: isEligible ? '#10B981' : '#3B82F6', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px' }}>
                    MIN 5 QTY
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: isEligible ? '#065F46' : '#1E40AF', lineHeight: '1.4' }}>
                  {isEligible ? (
                    <>🎉 <strong>10% First Member Bonus Unlocked!</strong> You get an extra <strong>₹{firstBonusPerUnit} OFF</strong> per item (Effective Price: <strong>₹{effectivePrice}/unit</strong>).</>
                  ) : (
                    <>Add <strong>{5 - quantity} more item(s)</strong> (minimum 5 total) as the first group member to unlock an extra <strong>10% Bonus Discount</strong>!</>
                  )}
                </p>
              </div>
            );
          })()}

          {/* Pricing Comparison Panel - Crucial spec highlight */}
          {(() => {
            const firstBonusPerUnit = calculateFirstUserBonus(product, true, quantity, true);
            const effectiveGroupPrice = product.groupPrice - firstBonusPerUnit;
            const itemSavings = product.originalPrice - effectiveGroupPrice;
            const totalSavingsCombined = itemSavings * quantity;

            return (
              <div style={{
                backgroundColor: 'var(--color-green-very-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(24, 83, 56, 0.1)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#5C6C62', display: 'block', fontWeight: 700 }}>OTHER APPS PRICE</span>
                    <span style={{ fontSize: '1.4rem', textDecoration: 'line-through', color: 'var(--color-error)', fontWeight: 600 }}>₹{product.originalPrice}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 800, display: 'block' }}>
                      {quantity >= 5 ? 'OUR APP (20% LOWER + 10% FIRST MEMBER BONUS)' : 'OUR APP PRICE (20% LOWER)'}
                    </span>
                    <span style={{ fontSize: '2.2rem', color: 'var(--color-primary)', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: '1' }}>
                      ₹{effectiveGroupPrice}
                    </span>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px dashed var(--color-border)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--color-green-bright)', fontWeight: 700, fontSize: '0.95rem' }}>
                    SAVE ₹{itemSavings} per item ({Math.round((itemSavings / product.originalPrice) * 100)}% Off)
                  </span>
                  {quantity > 1 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Total Savings: ₹{totalSavingsCombined}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dark)' }}>Quantity:</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ padding: '6px 12px', borderRight: '1px solid var(--color-border)', fontWeight: 'bold' }}
              >-</button>
              <span style={{ padding: '6px 16px', minWidth: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                style={{ padding: '6px 12px', borderLeft: '1px solid var(--color-border)', fontWeight: 'bold' }}
              >+</button>
            </div>
            {quantity < 5 && (
              <span style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 600 }}>
                💡 Select 5+ qty for extra 10% discount
              </span>
            )}
          </div>

          {/* Active Groups lists to Join */}
          {activeProductGroups.length > 0 && (
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              backgroundColor: 'var(--color-off-white)'
            }}>
              <h4 style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Users size={16} /> ACTIVE NEIGHBORHOOD GROUPS FOR THIS ITEM
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProductGroups.map(grp => (
                  <div 
                    key={grp.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Pickup point: {grp.dropPointName}
                      </span>
                      <button 
                        onClick={() => handleJoinExistingGroup(grp.id)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          backgroundColor: 'var(--color-primary)',
                          padding: '4px 10px',
                          borderRadius: '4px'
                        }}
                      >
                        JOIN & SAVE
                      </button>
                    </div>
                    <ProgressBar current={grp.currentMembers} target={grp.targetMembers} showLabels={false} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#5C6C62' }}>
                      <span>{grp.currentMembers} joined</span>
                      <span>{grp.targetMembers - grp.currentMembers} spots remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Buying Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              {/* Join Group / Start Group Button */}
              <Button 
                onClick={handleJoinNewGroup} 
                variant="primary" 
                size="lg"
                fullWidth={true}
                disabled={isExpired}
              >
                {isExpired ? 'DEAL CLOSED' : `JOIN GROUP & SAVE ₹${savings}`}
              </Button>
              
              {/* Buy Alone Button */}
              <Button 
                onClick={handleBuyAlone} 
                variant="secondary" 
                size="lg"
                fullWidth={true}
                disabled={isExpired}
              >
                {isExpired ? 'DEAL CLOSED' : `BUY ALONE (₹${product.originalPrice * quantity})`}
              </Button>
            </div>

            {/* Add to Monthly Basket Button */}
            <Button
              onClick={() => addToMonthlyBasket(product.id, quantity)}
              variant="secondary"
              fullWidth={true}
              disabled={isExpired}
            >
              {isExpired ? 'DEAL CLOSED' : 'Add to Monthly Basket (Repeat Purchase)'}
            </Button>
          </div>

          {/* Local Pickup Drop Point Note */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.8rem',
            color: '#5C6C62',
            backgroundColor: 'var(--color-green-very-light)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(24, 83, 56, 0.05)'
          }}>
            <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>Free Pickup from Drop Point</strong>
              <p>Your order will be sent to <strong>{selectedDropPoint.name}</strong>. Pick up within 7 days of arrival.</p>
              <p style={{ marginTop: '4px', fontWeight: 700, color: 'var(--color-green-bright)' }}>Expected Delivery: In 2 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Specifications Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Tabs Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-off-white)'
        }}>
          <button
            onClick={() => setSelectedTab('desc')}
            style={{
              padding: '16px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: selectedTab === 'desc' ? 'var(--color-primary)' : '#5C6C62',
              borderBottom: selectedTab === 'desc' ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRadius: 0
            }}
          >
            Product Description
          </button>
          <button
            onClick={() => setSelectedTab('specs')}
            style={{
              padding: '16px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: selectedTab === 'specs' ? 'var(--color-primary)' : '#5C6C62',
              borderBottom: selectedTab === 'specs' ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRadius: 0
            }}
          >
            Specifications
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '32px' }}>
          {selectedTab === 'desc' ? (
            <div style={{ lineHeight: '1.7', fontSize: '0.95rem', color: 'var(--color-dark-secondary)' }}>
              <p>{product.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
                  <span>100% Sourced Directly</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} style={{ color: 'var(--color-primary)' }} />
                  <span>Community Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={20} style={{ color: 'var(--color-primary)' }} />
                  <span>Local Drop Point Delivery</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(product.specifications).map(([key, val]) => (
                <div 
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '0.9rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{key}</span>
                  <span style={{ color: 'var(--color-dark-secondary)' }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
