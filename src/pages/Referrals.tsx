import React from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Gift, Share2, Clipboard, Users } from 'lucide-react';

export const Referrals: React.FC = () => {
  const { user, addNotification } = useHomekart();

  // If user is logged out, show placeholder promo card
  const referralCode = user ? user.referralCode : 'HOME123';
  const totalEarnings = user ? user.referralEarnings : 450;
  const totalReferred = user ? user.referralsCount : 3;
  const history = user ? user.referralHistory : [
    { name: 'Rohit Sharma', date: '2026-08-10', amount: 150 },
    { name: 'Amit Kumar', date: '2026-08-12', amount: 150 },
    { name: 'Priya Das', date: '2026-08-14', amount: 150 }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    addNotification('Referral code copied to clipboard!', 'success');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Hey! Join Homekart with my code ${referralCode} and get ₹100 off your first group buy! Join at ${window.location.origin}`);
    addNotification('Share message copied to clipboard!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Refer & Earn
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Invite your friends and neighbors to buy together and save more on everyday items.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }} className="referral-grid-responsive">
        
        {/* Left Column: Code sharing & instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main share card */}
          <div style={{
            backgroundColor: 'var(--color-cream)',
            border: '1px solid rgba(239, 165, 40, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FFF2D4',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Gift size={32} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>
                INVITE FRIENDS. SAVE TOGETHER.
              </h2>
              <p style={{ color: 'var(--color-dark-secondary)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '360px' }}>
                Your friend gets <strong>₹100 discount</strong> on their first order, and you earn <strong>₹150 cashback balance</strong> when their group confirms!
              </p>
            </div>

            {/* Code Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '2px dashed var(--color-accent)',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 20px',
              width: '100%',
              maxWidth: '280px',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '0.05em' }}>
                {referralCode}
              </span>
              <button 
                onClick={handleCopyCode}
                style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Clipboard size={16} /> Copy
              </button>
            </div>

            <Button onClick={handleShare} fullWidth={true} style={{ marginTop: '8px' }}>
              <Share2 size={16} style={{ marginRight: '6px' }} /> SHARE INVITE LINK
            </Button>
          </div>

          {/* How it works */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>How it works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem', color: '#5C6C62' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-green-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                <p>Send your code to friends, family or community members.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-green-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                <p>They apply your code during checkout to save ₹100 instantly on their first order.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-green-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                <p>Once their group buy deal is completed and picked up, ₹150 is added to your account.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Earnings Summary & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Earnings summary */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: '#5C6C62', fontWeight: 600 }}>Total Earnings</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{totalEarnings}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#5C6C62', fontWeight: 600 }}>Friends Registered</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalReferred}</p>
            </div>
          </div>

          {/* Referral History list */}
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
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} style={{ color: 'var(--color-primary)' }} /> Referral Rewards History
            </h3>

            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((h, i) => (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-off-white)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700 }}>{h.name}</p>
                      <span style={{ fontSize: '0.75rem', color: '#8C9B90' }}>Joined on {h.date}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      +₹{h.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#5C6C62', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                No referrals yet. Share your code to get rewards!
              </p>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .referral-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Referrals;
