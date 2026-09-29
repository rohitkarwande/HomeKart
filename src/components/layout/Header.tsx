import React, { useState, useEffect, useRef } from 'react';
import { useHomekart } from '../../store/homekartStore';
import { Logo } from '../common/Logo';
import {
  Search,
  MapPin,
  ShoppingBag,
  User,
  Users,
  ClipboardList,
  Bell,
  ShoppingBasket,
  ShieldCheck,
  Factory,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activePage,
    setPage,
    cart,
    selectedDropPoint,
    searchQuery,
    setSearchQuery,
    notifications,
    user,
    products,
    userRole
  } = useHomekart();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionsRef = useRef<HTMLFormElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Total cart items count
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setPage('shop');
  };

  const navItems = userRole === 'admin' ? [
    { id: 'admin', label: '👑 Admin Control Center', icon: ShieldCheck },
    { id: 'shop', label: '🛍️ Shop Market', icon: ShoppingBasket },
    { id: 'groups', label: '👥 Group Buying', icon: Users },
    { id: 'orders', label: '📦 Orders', icon: ClipboardList }
  ] : userRole === 'supplier' ? [
    { id: 'supplier', label: '🏭 Supplier Portal', icon: Factory },
    { id: 'shop', label: '🛍️ Shop Market', icon: ShoppingBasket },
    { id: 'groups', label: '👥 Group Buying', icon: Users },
    { id: 'orders', label: '📦 Orders', icon: ClipboardList }
  ] : [
    { id: 'shop', label: '🛍️ Shop Market', icon: ShoppingBasket },
    { id: 'groups', label: '👥 Community Groups', icon: Users },
    { id: 'orders', label: '📦 My Orders', icon: ClipboardList },
    { id: 'sellerKyc', label: user?.kycStatus === 'pending' ? '⏳ KYC Pending' : '💼 Become a Seller', icon: Factory },
    { id: 'leader', label: '🏆 Leaders', icon: User }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
    }}>
      {/* 1. TOP UTILITY BAR */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        padding: '5px 0',
        fontSize: '0.78rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Account Role:
              <strong style={{ color: 'var(--color-accent)', fontWeight: 800, marginLeft: '4px' }}>
                {userRole === 'admin'
                  ? '👑 System Administrator'
                  : userRole === 'supplier'
                  ? '🏭 Verified Seller'
                  : '🛒 Buyer Account'}
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {userRole === 'buyer' && (
              <button
                onClick={() => setPage(user ? 'sellerKyc' : 'auth')}
                style={{
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-dark)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {user?.kycStatus === 'pending' ? '⏳ KYC Application Under Review' : '💼 Apply for Seller Verification'}
              </button>
            )}
            {userRole === 'supplier' && (
              <button
                onClick={() => setPage('supplier')}
                style={{
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none'
                }}
              >
                🏭 Open Supplier Portal
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setPage('admin')}
                style={{
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none'
                }}
              >
                👑 Admin Control Center
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (Brand Logo, Drop Point, Search, Cart, Auth) */}
      <div className="container" style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Logo and Drop Point Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
            <Logo size="md" />
          </div>

          {/* Drop Point Selector Card */}
          <div 
            onClick={() => setPage('dropPoints')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              fontSize: '0.82rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              maxWidth: '200px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease'
            }}
            title="Choose pickup drop point"
          >
            <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedDropPoint ? selectedDropPoint.name.split(' ')[0] + ' Point' : 'Select Point'}
            </span>
            <ChevronDown size={14} style={{ opacity: 0.6 }} />
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '520px',
            position: 'relative',
            display: 'flex'
          }}
          className="header-search-desktop"
          ref={suggestionsRef}
        >
          <input
            type="text"
            placeholder="Search vegetables, electronics, clothes, groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 88px 10px 42px',
              borderRadius: '24px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontSize: '0.88rem',
              color: '#0F172A',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.backgroundColor = '#FFFFFF';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#CBD5E1';
              e.target.style.backgroundColor = '#F8FAFC';
            }}
          />
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748B'
            }} 
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              style={{
                position: 'absolute',
                right: '64px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                padding: '4px',
                zIndex: 10
              }}
            >
              ✕
            </button>
          )}
          <button 
            type="submit" 
            style={{
              position: 'absolute',
              right: '4px',
              top: '4px',
              bottom: '4px',
              padding: '0 16px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Find
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--color-primary)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 250,
              marginTop: '6px',
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setPage('product', { id: s.id });
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #F1F5F9',
                    fontSize: '0.88rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{s.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{s.category}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>₹{s.groupPrice}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Right Actions: Notifications, Cart, Auth Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Notification Bell Icon Container */}
          <button 
            onClick={() => setPage('notifications')}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              backgroundColor: activePage === 'notifications' ? '#F0FDF4' : '#FFFFFF',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-error)',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {/* Cart Button Card */}
          <button 
            onClick={() => setPage('cart')}
            style={{
              position: 'relative',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--color-primary)',
              backgroundColor: 'var(--color-green-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px',
                marginLeft: '2px'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button Cards */}
          {user ? (
            <button 
              onClick={() => setPage('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: activePage === 'profile' ? '#F1F5F9' : '#FFFFFF',
                color: '#1E293B',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <User size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} className="header-username">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage('auth')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-primary)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <User size={16} /> Sign In
              </button>

              <button
                onClick={() => setPage('auth')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-primary)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <User size={16} /> Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. SECONDARY DEDICATED NAVIGATION BAR (Page Tabs Bar) */}
      <nav style={{
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        padding: '6px 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                  backgroundColor: isActive ? 'var(--color-primary)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 4px rgba(24,83,56,0.2)' : 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* CSS stylesheet helper styles for header responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .header-search-desktop {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
export default Header;
