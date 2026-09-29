import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { 
  Users, 
  MapPin, 
  ShoppingBasket, 
  ArrowRight, 
  Award, 
  Gift, 
  Sparkles, 
  ShieldCheck,
  Clock,
  Truck,
  Edit3,
  Check,
  X,
  Star
} from 'lucide-react';
import { getCountdownText } from '../utils/pricing';

export const Home: React.FC = () => {
  const { 
    setPage, 
    groups, 
    joinGroupDirectly, 
    setSelectedCategory, 
    products, 
    addToCart,
    user,
    updateUserInterestedCategories
  } = useHomekart();

  // Interested Categories State
  const userInterests = (user?.interestedCategories && user.interestedCategories.length > 0)
    ? user.interestedCategories
    : ['Vegetables & Fruits', 'Tech Products'];

  const [activeInterestTab, setActiveInterestTab] = useState<string>('All');
  const [isEditInterestsOpen, setIsEditInterestsOpen] = useState(false);
  const [tempSelectedInterests, setTempSelectedInterests] = useState<string[]>(userInterests);

  const ALL_CATEGORY_OPTIONS = [
    { name: 'Vegetables & Fruits', label: '🥦 Vegetables & Fruits', desc: 'Fresh farm harvest & organic salad greens' },
    { name: 'Tech Products', label: '📱 Tech Products', desc: 'Headphones, smartwatches, 4K streaming' },
    { name: 'Clothes & Fashion', label: '👕 Clothes & Fashion', desc: 'Organic cotton apparel & stretch denim' },
    { name: 'Salon Products', label: '💅 Salon Products', desc: 'Face packs, massage creams & hair spa' },
    { name: 'Staples', label: '🌾 Staples & Groceries', desc: 'Sharbati atta, pulses, rice & cooking oil' },
    { name: 'Home Essentials', label: '🏠 Home Essentials', desc: 'Cleaning supplies & home storage' },
    { name: 'Dairy & Bakery', label: '🧀 Dairy & Bakery', desc: 'Fresh milk, paneer, artisan bread' },
    { name: 'Snacks', label: '🍿 Snacks & Beverages', desc: 'Healthy roasted nuts & fresh juices' }
  ];

  const handleSaveInterests = async () => {
    if (user) {
      await updateUserInterestedCategories(tempSelectedInterests);
    }
    setIsEditInterestsOpen(false);
  };

  const toggleInterest = (catName: string) => {
    setTempSelectedInterests(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  // Filter products matching interested categories
  const interestedProducts = products.filter(p => {
    if (activeInterestTab !== 'All') {
      return p.category === activeInterestTab;
    }
    return userInterests.includes(p.category);
  });

  // Fallback to all products if none matched
  const displayInterestedProducts = interestedProducts.length > 0 
    ? interestedProducts 
    : products.slice(0, 6);

  // Find popular active group deals whose products are not expired
  const popularGroups = groups.filter(g => {
    const prod = products.find(p => p.id === g.productId);
    if (!prod) return false;
    const isExpired = prod.expiresAt ? (new Date() > new Date(prod.expiresAt)) : false;
    return !isExpired && (g.status === 'Open' || g.status === 'Almost Full');
  }).slice(0, 3);

  // Core categories
  const categories = [
    { name: 'Vegetables & Fruits', count: 'Farm Fresh Harvest', icon: ShoppingBasket, color: '#DCFCE7' },
    { name: 'Tech Products', count: 'Audio & Smart Gadgets', icon: ShieldCheck, color: '#F1F3F8' },
    { name: 'Clothes & Fashion', count: 'Cotton & Denim', icon: Gift, color: '#FEF3C7' },
    { name: 'Salon Products', count: 'Beauty & Skincare', icon: Sparkles, color: '#FCF3DF' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }} className="animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section style={{
        background: 'radial-gradient(circle at top right, var(--color-green-very-light), var(--color-white))',
        padding: '64px 0',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '40px'
        }}>
          {/* Hero Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-green-light)',
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              width: 'fit-content'
            }}>
              <Users size={14} /> COMMUNITY GROUP BUYING
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              lineHeight: '1.15',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-dark)'
            }}>
              Buy together.<br />
              <span style={{ color: 'var(--color-accent)' }}>Pay less.</span>
            </h1>
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--color-dark-secondary)',
              lineHeight: '1.6',
              maxWidth: '480px'
            }}>
              Join active local groups, unlock bulk pricing rewards, and collect orders from a neighborhood drop point. Why buy alone?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
              <Button onClick={() => setPage('shop')} size="lg" variant="primary">
                SHOP NOW
              </Button>
              <Button onClick={() => setPage('groups')} size="lg" variant="secondary">
                EXPLORE GROUPS
              </Button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '0.85rem',
              color: '#5C6C62',
              marginTop: '12px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '20px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-green-bright)' }} /> Verified Suppliers
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: 'var(--color-green-bright)' }} /> Local Drop Points
              </span>
            </div>
          </div>

          {/* Hero Illustration / Image */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '440px',
              height: '380px',
              borderRadius: '24px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: '4px solid #FFFFFF'
            }} />
            {/* Overlay Savings Badge */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '12px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '16px 20px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>Average Savings</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Up to 30% Off</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERESTED CATEGORIES PERSONALIZED HOMEPAGE FEED */}
      <section className="container">
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '20px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '6px'
              }}>
                <Sparkles size={14} /> YOUR PERSONALIZED HOMEPAGE FEED
              </div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--color-dark)' }}>
                Products From Your Interested Categories
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '2px' }}>
                Prioritizing your favorite categories: <strong style={{ color: 'var(--color-primary)' }}>{userInterests.join(', ')}</strong>
              </p>
            </div>

            <Button
              onClick={() => {
                setTempSelectedInterests(userInterests);
                setIsEditInterestsOpen(true);
              }}
              variant="secondary"
              size="sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit3 size={15} /> Customize Interested Categories
            </Button>
          </div>

          {/* Interest Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setActiveInterestTab('All')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeInterestTab === 'All' ? 'var(--color-primary)' : '#F1F5F9',
                color: activeInterestTab === 'All' ? '#FFFFFF' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              ✨ All My Interests ({userInterests.length})
            </button>

            {userInterests.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveInterestTab(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeInterestTab === cat ? 'var(--color-primary)' : '#F1F5F9',
                  color: activeInterestTab === cat ? '#FFFFFF' : '#475569',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid of Interested Categories */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {displayInterestedProducts.map(prod => {
              const savingsPct = Math.round(((prod.originalPrice - prod.groupPrice) / prod.originalPrice) * 100);

              return (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative'
                  }}
                  className="category-card-hover"
                >
                  {/* Category Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    zIndex: 2,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {prod.category}
                  </div>

                  {savingsPct > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-dark)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      zIndex: 2
                    }}>
                      SAVE {savingsPct}%
                    </div>
                  )}

                  <div 
                    onClick={() => setPage('product', { id: prod.id })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ padding: '16px 16px 8px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#F59E0B', marginBottom: '4px' }}>
                        <Star size={14} fill="#F59E0B" />
                        <span style={{ fontWeight: 800 }}>{prod.rating}</span>
                        <span style={{ color: '#94A3B8' }}>({prod.reviewsCount})</span>
                      </div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1E293B',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.6em'
                      }}>
                        {prod.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Price banner comparison */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Other Apps</span>
                        <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>₹{prod.originalPrice}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 800, display: 'block' }}>Our Group Price</span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 800 }}>₹{prod.groupPrice}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Button
                        onClick={() => addToCart(prod, 1, false)}
                        variant="secondary"
                        size="sm"
                        style={{ fontSize: '0.78rem', padding: '8px 6px' }}
                      >
                        BUY ALONE
                      </Button>
                      <Button
                        onClick={() => setPage('product', { id: prod.id })}
                        variant="primary"
                        size="sm"
                        style={{ fontSize: '0.78rem', padding: '8px 6px' }}
                      >
                        GROUP BUY
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL PROMOTIONAL BANNERS */}
      <section className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Salon Products Banner */}
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ zIndex: 2 }}>
              <span style={{
                color: 'var(--color-accent)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em'
              }}>SALON PRODUCTS · EXCLUSIVE DEALS</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                color: '#FFFFFF',
                fontSize: '2rem',
                marginTop: '12px',
                marginBottom: '8px'
              }}>Salon products, group priced</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>Premium face packs · massage creams · spa essentials</p>
            </div>
            <div style={{ zIndex: 2, marginTop: '24px' }}>
              <Button 
                onClick={() => { setSelectedCategory('Salon Products'); setPage('shop'); }} 
                variant="accent"
              >
                Shop beauty <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Button>
            </div>
            {/* Background Image Overlay */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              width: '180px',
              height: '180px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=300&auto=format&fit=crop&q=80")',
              backgroundSize: 'cover',
              borderRadius: '50%',
              opacity: 0.25
            }} />
          </div>

          {/* Technology Banner */}
          <div style={{
            backgroundColor: '#1E293B', // Slate gray background
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ zIndex: 2 }}>
              <span style={{
                color: 'var(--color-accent)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em'
              }}>NEW TECH · GROUP PRICES</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                color: '#FFFFFF',
                fontSize: '2rem',
                marginTop: '12px',
                marginBottom: '8px'
              }}>Tech products, group priced</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>Noise-cancelling headphones · smartwatch GPS</p>
            </div>
            <div style={{ zIndex: 2, marginTop: '24px' }}>
              <Button 
                onClick={() => { setSelectedCategory('Tech Products'); setPage('shop'); }} 
                variant="accent"
              >
                Explore tech <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Button>
            </div>
            {/* Background Image Overlay */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              width: '180px',
              height: '180px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80")',
              backgroundSize: 'cover',
              borderRadius: '50%',
              opacity: 0.25
            }} />
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem' }}>Shop by Category</h2>
          <button 
            onClick={() => { setSelectedCategory('All'); setPage('shop'); }}
            style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            View all
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => { setSelectedCategory(cat.name); setPage('shop'); }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                className="category-card-hover"
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)'
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-ui)', color: 'var(--color-dark)' }}>{cat.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{cat.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. POPULAR GROUP DEALS */}
      <section className="container" style={{
        backgroundColor: 'var(--color-green-very-light)',
        padding: '40px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Popular Group Deals</h2>
            <p style={{ fontSize: '0.9rem', color: '#5C6C62', marginTop: '4px' }}>Join active groups to unlock better pricing today</p>
          </div>
          <button 
            onClick={() => setPage('groups')} 
            style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            Explore all groups
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {popularGroups.map(group => {
            return (
              <div 
                key={group.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Product details */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img 
                    src={group.productImage} 
                    alt={group.productName} 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Badge status={group.status} />
                    <h3 
                      onClick={() => setPage('product', { id: group.productId })}
                      style={{ 
                        fontSize: '1rem', 
                        fontFamily: 'var(--font-ui)', 
                        fontWeight: 700,
                        marginTop: '6px',
                        cursor: 'pointer',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {group.productName}
                    </h3>
                  </div>
                </div>

                {/* Price block */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  backgroundColor: 'var(--color-off-white)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#5C6C62', fontWeight: 600 }}>Other Apps</span>
                    <p style={{ textDecoration: 'line-through', color: 'var(--color-error)', fontWeight: 600 }}>₹{group.originalPrice}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800 }}>Our App</span>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.15rem' }}>₹{group.groupPrice}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '4px', padding: '4px 8px', marginTop: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                    Other Apps: ₹{group.originalPrice} · Our App: 20% Lower (₹{group.groupPrice})
                  </div>
                </div>

                {/* Member Progress */}
                <ProgressBar current={group.currentMembers} target={group.targetMembers} />

                {/* Action button */}
                <Button 
                  onClick={() => joinGroupDirectly(group.id)}
                  fullWidth={true}
                >
                  JOIN GROUP
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Featured Products</h2>
            <p style={{ fontSize: '0.9rem', color: '#5C6C62', marginTop: '4px' }}>Curated premium items with unlocked community pricing</p>
          </div>
          <button 
            onClick={() => setPage('shop')} 
            style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            View Shop
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {products.filter(p => {
            const isExpired = p.expiresAt ? (new Date() > new Date(p.expiresAt)) : false;
            return ['da7a1000-0000-0000-0000-000000000001', 'da7a1000-0000-0000-0000-000000000002', 'da7a1000-0000-0000-0000-000000000004'].includes(p.id) && !isExpired;
          }).map(product => {
            const activeGroup = groups.find(g => g.productId === product.id && (g.status === 'Open' || g.status === 'Almost Full'));
            return (
              <div 
                key={product.id}
                onClick={() => setPage('product', { id: product.id })}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="product-card"
              >
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'var(--color-gray-light)' }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: 'var(--color-primary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>{product.category}</span>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-ui)', height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                  </h3>
                  <div style={{
                    backgroundColor: 'var(--color-green-very-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#5C6C62', display: 'block', fontWeight: 600 }}>Other Apps</span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', fontSize: '0.8rem', fontWeight: 600 }}>₹{product.originalPrice}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 800, display: 'block' }}>Our App</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.1rem' }}>₹{product.groupPrice}</span>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    color: '#92400E',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Other Apps: <span style={{ textDecoration: 'line-through' }}>₹{product.originalPrice}</span></span>
                    <span style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                      Our App 20% Lower
                    </span>
                  </div>

                  {/* Group Buy Progress Bar */}
                  <div style={{ margin: '4px 0' }}>
                    <ProgressBar 
                      current={activeGroup ? activeGroup.currentMembers : 0} 
                      target={activeGroup ? activeGroup.targetMembers : 5}
                    />
                  </div>

                  {/* Time Remaining & Expected Delivery */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#5C6C62',
                    backgroundColor: 'var(--color-off-white)',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      <Clock size={12} />
                      <span>{getCountdownText(product.expiresAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-green-bright)' }}>
                      <Truck size={12} />
                      <span>Expected Delivery: In 2 days</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                    <Button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1, true); setPage('cart'); }}
                      size="sm"
                    >
                      JOIN GROUP
                    </Button>
                    <Button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1, false); setPage('cart'); }}
                      variant="secondary"
                      size="sm"
                    >
                      BUY ALONE
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW GROUP BUYING WORKS */}
      <section className="container">
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '12px' }}>How Homekart Group Buying Works</h2>
        <p style={{ fontSize: '1rem', color: '#5C6C62', textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px auto' }}>
          Buy products together with friends and neighbors to unlock better discount tier prices. Simply select your drop point and pay together.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {[
            { step: '1', title: 'Find a Product', desc: 'Choose from fresh groceries, daily essentials, or tech gadgets in our store.' },
            { step: '2', title: 'Join or Start a Group', desc: 'Select Group Price on the product page. Join an existing neighborhood group or start a new one.' },
            { step: '3', title: 'Wait for Members', desc: 'Invite friends or neighbors to join your group to hit the member target before the deadline.' },
            { step: '4', title: 'Pick up Locally', desc: 'Once confirmed, your items are delivered to your chosen local drop point for free pickup.' }
          ].map((item, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '24px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem'
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-ui)', fontWeight: 700, marginTop: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DROP POINT MAP PREVIEW SECTION */}
      <section className="container" style={{
        backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-green-medium))',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        alignItems: 'center',
        gap: '40px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '2.2rem' }}>Zero Delivery Fees.<br />Pick up locally.</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
            Homekart utilizes local neighborhood drop points (like local grocery stores or community centers) as collective drop-offs. By picking up your items yourself, we skip home-delivery shipping costs and pass those savings directly back to you!
          </p>
          <div>
            <Button onClick={() => setPage('dropPoints')} variant="accent">
              Find Nearby Drop Points
            </Button>
          </div>
        </div>

        {/* Visual Map Simulation */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          color: 'var(--color-dark)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h4 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} /> Nearby Powai Drops
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Hiranandani Gardens Point', dist: '1.2 km away', time: '9 AM - 9 PM' },
              { name: 'Powai Community Point', dist: '2.0 km away', time: '8 AM - 10 PM' }
            ].map((pt, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-off-white)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{pt.name}</p>
                  <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{pt.time}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>{pt.dist}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MONTHLY BASKET PROMO */}
      <section className="container" style={{
        backgroundColor: 'var(--color-green-very-light)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-green-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBasket size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>Setup Your Monthly Basket</h3>
            <p style={{ fontSize: '0.9rem', color: '#5C6C62', marginTop: '4px' }}>Save time and money by organizing your frequently purchased daily essentials.</p>
          </div>
        </div>
        <div>
          <Button onClick={() => setPage('monthlyBasket')}>
            Manage My Basket →
          </Button>
        </div>
      </section>

      {/* 7. DUAL MARKETING CARD: REFERRALS + LEADER */}
      <section className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px'
      }}>
        {/* Leader Segment */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-green-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Become a Community Leader</h3>
            <p style={{ fontSize: '0.9rem', color: '#5C6C62', lineHeight: '1.6' }}>
              Manage a local Homekart Drop Point in your community. Coordinate deliveries, support neighbors, and earn commission payouts on every order processed.
            </p>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Button onClick={() => setPage('leader')} variant="secondary" fullWidth={true}>
              Apply as Leader
            </Button>
          </div>
        </div>

        {/* Refer & Earn Segment */}
        <div style={{
          backgroundColor: 'var(--color-cream)',
          border: '1px solid rgba(239, 165, 40, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#FFF2D4',
              color: '#B25E00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Gift size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>Invite Friends, Save Together</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-dark-secondary)', lineHeight: '1.6' }}>
              Share your unique referral link. You earn ₹150 for every friend who registers and joins their first group buy, plus they unlock a discount bonus!
            </p>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Button onClick={() => setPage('referrals')} variant="primary" fullWidth={true}>
              Refer & Earn
            </Button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EDIT INTERESTS MODAL */}
      {isEditInterestsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} className="animate-fade-in">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '580px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>🎯 Customize Your Interested Categories</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                  Select or unselect categories to customize which products appear in front on your homepage
                </p>
              </div>
              <button
                onClick={() => setIsEditInterestsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {ALL_CATEGORY_OPTIONS.map(cat => {
                const isSelected = tempSelectedInterests.includes(cat.name);
                return (
                  <div
                    key={cat.name}
                    onClick={() => toggleInterest(cat.name)}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '2px solid #94A3B8',
                      backgroundColor: isSelected ? 'var(--color-primary)' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{cat.label}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>{cat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <Button onClick={() => setIsEditInterestsOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleSaveInterests} variant="primary">
                Save & Update Homepage
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Helper styles for category cards */}
      <style>{`
        .category-card-hover:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </div>
  );
};
export default Home;
