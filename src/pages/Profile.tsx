import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  ShoppingBag, 
  Users, 
  MapPin, 
  Gift, 
  ShoppingBasket, 
  Award, 
  LogOut,
  TrendingDown,
  CreditCard,
  HelpCircle,
  Info,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout, setPage, orders, leaderProfile } = useHomekart();
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'help' | 'about' | null>(null);

  if (!user) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>Please log in to view your profile</h2>
        <Button onClick={() => setPage('auth')} style={{ marginTop: '16px' }}>Go to Login</Button>
      </div>
    );
  }

  // Calculate total saved across successful orders
  const totalOrders = orders.length;
  const totalSaved = orders.reduce((sum, o) => sum + o.savings, 0);

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, page: 'orders' },
    { label: 'My Groups', icon: Users, page: 'groups' },
    { label: 'Monthly Basket', icon: ShoppingBasket, page: 'monthlyBasket' },
    { label: 'Drop Points', icon: MapPin, page: 'dropPoints' },
    { label: 'Refer & Earn', icon: Gift, page: 'referrals' },
    { 
      label: leaderProfile.status === 'Active' ? 'Leader Dashboard' : 'Become a Leader', 
      icon: Award, 
      page: 'leader' 
    },
    { label: 'Payments & Saved Cards', icon: CreditCard, subTab: 'payments' },
    { label: 'Notifications Feed', icon: Bell, page: 'notifications' },
    { label: 'Settings & Security', icon: SettingsIcon, page: 'settings' },
    { label: 'Help & FAQ Desk', icon: HelpCircle, subTab: 'help' },
    { label: 'About Homekart Corp', icon: Info, subTab: 'about' }
  ];

  if (activeSubTab === 'payments') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setActiveSubTab(null)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '0.95rem', 
              color: 'var(--color-primary)', 
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-green-light)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>Payments & Saved Cards</h2>
        </div>

        {/* Mock Credit Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #0e2a1c 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '180px'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Homekart Community Pay</span>
            <h3 style={{ fontSize: '1.2rem', marginTop: '12px', letterSpacing: '2px', fontFamily: 'monospace' }}>4312 •••• •••• 9840</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontSize: '0.6rem', opacity: 0.6, display: 'block', textTransform: 'uppercase' }}>Card Holder</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.6rem', opacity: 0.6, display: 'block', textTransform: 'uppercase' }}>Expires</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>09/31</span>
            </div>
          </div>
        </div>

        {/* Saved UPI Handles */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-ui)' }}>Saved UPI Handles</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-off-white)' }}>
            <span style={{ fontWeight: 600 }}>{user.mobile}@oksbi</span>
            <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 }}>PRIMARY</span>
          </div>
        </div>

        {/* Recent Payouts / Transactions log */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-ui)', marginBottom: '16px' }}>Recent Payouts & Refunds</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { date: 'Aug 14, 2026', type: 'Refund (Basmati Rice)', amt: '+₹150', status: 'Refunded' },
              { date: 'Aug 10, 2026', type: 'Referral Bonus', amt: '+₹150', status: 'Credited' }
            ].map((tx, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: idx === 1 ? 'none' : '1px solid var(--color-border)' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{tx.type}</p>
                  <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{tx.date}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{tx.amt}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700 }}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'help') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setActiveSubTab(null)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '0.95rem', 
              color: 'var(--color-primary)', 
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-green-light)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>Help & FAQs</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'How does Homekart Group Buying save me money?', a: 'By coordinating orders within your neighborhood, we ship all items collectively to one local leader Drop Point. This removes individual delivery shipping fees and middleman margins, allowing us to sell high-quality groceries and tech items at group discounts.' },
            { q: 'What happens if my group target is not met?', a: 'If a group does not reach its minimum required members (e.g. 5 members) before the deadline, the group deal expires. The order is automatically cancelled, and a full refund is immediately processed back to your original payment method.' },
            { q: 'Are there any home shipping fees?', a: 'No! Homekart deliveries are collective drop-offs to your preferred local drop point. Self-pickup is completely free of charge, which is why there are no delivery fees at checkout.' },
            { q: 'How can I become a local leader?', a: 'You can apply to manage a drop point under the "Become a Leader" section of your Profile. Once approved, you earn commission margins on all community packages picked up from your point.' }
          ].map((faq, idx) => (
            <div key={idx} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '8px' }}>{faq.q}</h4>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62', lineHeight: '1.5' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'about') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setActiveSubTab(null)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '0.95rem', 
              color: 'var(--color-primary)', 
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-green-light)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>About Homekart</h2>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
          lineHeight: '1.6'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--color-primary)' }}>Buy Together. Pay Less.</h3>
          <p style={{ fontSize: '0.9rem', color: '#5C6C62' }}>
            Homekart is India's premier community-driven group buying marketplace. We believe that quality everyday essentials, groceries, and electronics should be accessible to every household without inflating pricing with home delivery shipping markups.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#5C6C62' }}>
            By leveraging local neighborhood Drop Points managed by passionate community Leaders, Homekart aggregates demand. When neighbors coordinate their purchases, they unlock bulk supplier pricing directly.
          </p>
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
            fontSize: '0.8rem',
            color: '#8C9B90',
            textAlign: 'center'
          }}>
            © 2026 Homekart Commerce Private Ltd. All Rights Reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* Profile Card Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Profile Initial avatar */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          fontSize: '1.6rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {user.name.charAt(0)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>
            {user.name}
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#5C6C62' }}>
            +91 {user.mobile}
          </span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Badge status="MEMBER" />
            {leaderProfile.status === 'Active' && <Badge status="LEADER" />}
          </div>
        </div>
      </div>

      {/* Account statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#5C6C62', fontWeight: 600 }}>Total Orders Placed</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
            {totalOrders}
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--color-green-very-light)',
          border: '1px solid rgba(24, 83, 56, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <TrendingDown size={14} /> Total Group Savings
          </span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
            ₹{totalSaved}
          </p>
        </div>
      </div>

      {/* Profile menu links */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                if (item.subTab) {
                  setActiveSubTab(item.subTab as any);
                } else if (item.page) {
                  setPage(item.page);
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: index === menuItems.length - 1 ? 'none' : '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                textAlign: 'left',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-dark)',
                cursor: 'pointer',
                borderRadius: 0,
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-off-white)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                <span>{item.label}</span>
              </div>
              <span style={{ color: '#8C9B90', fontSize: '1rem' }}>›</span>
            </button>
          );
        })}
      </div>

      {/* Logout & help */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button 
          onClick={logout}
          variant="secondary"
          fullWidth={true}
        >
          <LogOut size={16} style={{ marginRight: '6px' }} /> LOG OUT
        </Button>
      </div>

    </div>
  );
};
export default Profile;
