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
  ShoppingBasket
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
    products
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

  const navItems = [
    { id: 'shop', label: 'Shop', icon: ShoppingBasket },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'leader', label: 'Leaders', icon: User },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Upper bar: Logo, Search, Location, Cart, Profile */}
      <div className="container" style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Logo and Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div onClick={() => setPage('home')}>
            <Logo size="md" />
          </div>
        </div>

        {/* Drop Point Selector */}
        <div 
          onClick={() => setPage('dropPoints')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-green-very-light)',
            border: '1px solid rgba(24, 83, 56, 0.1)',
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
            fontWeight: 600,
            maxWidth: '220px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title="Choose pickup drop point"
        >
          <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedDropPoint ? selectedDropPoint.name : 'Choose Drop Point'}
          </span>
        </div>

        {/* Search Bar (Desktop) */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '460px',
            position: 'relative',
            display: 'flex'
          }}
          className="header-search-desktop"
          ref={suggestionsRef}
        >
          <input
            type="text"
            placeholder="Search groceries, gadgets, home items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 84px 10px 42px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-off-white)',
              fontSize: '0.9rem',
              color: 'var(--color-dark)',
              outline: 'none',
              transition: 'border var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8C9B90'
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
                color: '#8C9B90',
                cursor: 'pointer',
                fontSize: '1rem',
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
              padding: '0 12px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600
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
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
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
                    padding: '10px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-off-white)',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-green-very-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#8C9B90', textTransform: 'uppercase' }}>{s.category}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{s.groupPrice}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Desktop Navigation Links */}
        <nav className="header-nav-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-dark-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  padding: '8px 0',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  borderRadius: 0,
                  transition: 'color var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions: Notifications, Cart, Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Notification Bell */}
          <button 
            onClick={() => setPage('notifications')}
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: activePage === 'notifications' ? 'var(--color-green-light)' : 'transparent',
              color: 'var(--color-primary)'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-error)',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => setPage('cart')}
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: activePage === 'cart' ? 'var(--color-green-light)' : 'transparent',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShoppingBag size={20} />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-dark)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Login Link */}
          <button 
            onClick={() => setPage(user ? 'profile' : 'auth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              backgroundColor: activePage === 'profile' ? 'var(--color-green-light)' : 'var(--color-white)',
              color: 'var(--color-primary)'
            }}
          >
            <User size={18} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }} className="header-username">
              {user ? user.name.split(' ')[0] : 'Login'}
            </span>
          </button>
        </div>
      </div>

      {/* CSS stylesheet helper styles for header responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .header-search-desktop,
          .header-nav-desktop,
          .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
export default Header;
