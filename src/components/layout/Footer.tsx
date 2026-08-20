import React from 'react';
import { useHomekart } from '../../store/homekartStore';
import { Logo } from '../common/Logo';
import { Mail, Phone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setPage } = useHomekart();

  return (
    <footer style={{
      backgroundColor: 'var(--color-primary)',
      color: '#FFFFFF',
      padding: '48px 0 24px 0',
      marginTop: '64px',
      borderTop: '4px solid var(--color-accent)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '32px'
      }}>
        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Logo size="md" lightText={true} />
          <p style={{
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.75)'
          }}>
            Homekart is India's modern community-driven marketplace. Buy together, pay less, and pick up from your nearby drop point.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} style={{ color: 'var(--color-accent)' }} /> +91 98765 43211
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} style={{ color: 'var(--color-accent)' }} /> support@homekart.co.in
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            color: 'var(--color-accent)',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            fontFamily: 'var(--font-ui)'
          }}>
            Shop & Groups
          </h4>
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <li><button onClick={() => setPage('shop')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Browse Shop</button></li>
            <li><button onClick={() => setPage('groups')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Active Groups</button></li>
            <li><button onClick={() => setPage('monthlyBasket')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Monthly Basket</button></li>
            <li><button onClick={() => setPage('dropPoints')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Drop Points</button></li>
          </ul>
        </div>

        {/* Community Links */}
        <div>
          <h4 style={{
            color: 'var(--color-accent)',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            fontFamily: 'var(--font-ui)'
          }}>
            Community
          </h4>
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <li><button onClick={() => setPage('leader')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Become a Leader</button></li>
            <li><button onClick={() => setPage('referrals')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>Refer & Earn</button></li>
            <li><button onClick={() => setPage('profile')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>My Profile</button></li>
            <li><button onClick={() => setPage('orders')} style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', border: 'none', padding: 0 }}>My Orders</button></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 style={{
            color: 'var(--color-accent)',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            fontFamily: 'var(--font-ui)'
          }}>
            Information
          </h4>
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <li><a href="#" onClick={(e) => e.preventDefault()}>About Us</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>How Group Buying Works</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Help & FAQs</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Terms & Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Lower Copyright Area */}
      <div className="container" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '0.8rem',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <span>© {new Date().getFullYear()} Homekart Commerce Pvt Ltd. All rights reserved.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={12} style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }} /> for community saving.
        </span>
      </div>
    </footer>
  );
};
export default Footer;
