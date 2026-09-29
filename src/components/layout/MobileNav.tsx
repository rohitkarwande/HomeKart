import React from 'react';
import { useHomekart } from '../../store/homekartStore';
import { Home, ShoppingBasket, Users, ClipboardList, User, ShieldCheck, Factory } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activePage, setPage, user, userRole } = useHomekart();

  const navItems = userRole === 'admin' ? [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'shop', label: 'Shop', icon: ShoppingBasket },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User, loginRedirect: true }
  ] : userRole === 'supplier' ? [
    { id: 'supplier', label: 'Supplier', icon: Factory },
    { id: 'shop', label: 'Shop', icon: ShoppingBasket },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User, loginRedirect: true }
  ] : [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Shop', icon: ShoppingBasket },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User, loginRedirect: true }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      boxShadow: '0 -2px 10px rgba(14, 42, 28, 0.05)',
      zIndex: 99,
    }} className="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        
        // Match active status
        let isActive = activePage === item.id;
        if (item.id === 'profile' && activePage === 'auth') {
          isActive = true;
        }

        const handleClick = () => {
          if (item.loginRedirect && !user) {
            setPage('auth');
          } else {
            setPage(item.id);
          }
        };

        return (
          <button
            key={item.id}
            onClick={handleClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? 'var(--color-primary)' : '#5C6C62',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'color var(--transition-fast)'
            }}
          >
            <Icon size={20} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Hide bottom navigation on larger desktop screens */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
        /* Extra padding for body so content is not cut off by bottom nav on mobile */
        @media (max-width: 768px) {
          body {
            padding-bottom: 70px !important;
          }
        }
      `}</style>
    </nav>
  );
};
export default MobileNav;
