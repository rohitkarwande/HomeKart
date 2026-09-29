import React from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Clock, 
  Share2, 
  Sparkles, 
  UserCheck,
  Phone
} from 'lucide-react';

export const GroupDetail: React.FC = () => {
  const { 
    pageParams, 
    setPage, 
    groups, 
    dropPoints,
    joinGroupDirectly, 
    simulateFriendJoin,
    addNotification,
    user,
    isLoading
  } = useHomekart();

  const groupId = pageParams.id;
  const group = groups.find(g => g.id === groupId);
  const isMember = group ? (group.memberNames.includes(user?.name || '') || group.memberNames.includes('You')) : false;

  if (!group) {
    if (isLoading || groups.length === 0) {
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
          <p style={{ color: '#5C6C62' }}>Loading group details...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>Group not found</h2>
        <Button onClick={() => setPage('groups')} style={{ marginTop: '16px' }}>Back to Groups</Button>
      </div>
    );
  }

  const dropPoint = dropPoints.find(dp => dp.id === group.dropPointId);

  const remaining = group.targetMembers - group.currentMembers;

  const handleInviteSimulate = () => {
    simulateFriendJoin(group.id);
    addNotification('Someone joined your group!', 'success');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?group=${group.id}`);
    addNotification('Group link copied to clipboard! Share it to unlock group savings.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Back Link */}
      <div>
        <button 
          onClick={() => setPage('groups')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Groups
        </button>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px'
      }}>
        
        {/* Left Column: Product & Drop Point Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Product card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            gap: '20px'
          }}>
            <img 
              src={group.productImage} 
              alt={group.productName} 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--color-border)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Selected Product</span>
              <h2 
                onClick={() => setPage('product', { id: group.productId })}
                style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', cursor: 'pointer' }}
              >
                {group.productName}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{group.groupPrice}</span>
                <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--color-error)' }}>₹{group.originalPrice}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-green-bright)' }}>Save ₹{group.savings}</span>
              </div>
            </div>
          </div>

          {/* Drop Point Details */}
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
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--color-primary)' }} /> Neighborhood Drop Point
            </h3>
            
            <div style={{
              backgroundColor: 'var(--color-off-white)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)' }}>{group.dropPointName}</p>
              <p style={{ color: '#5C6C62', lineHeight: '1.5' }}>
                {dropPoint ? dropPoint.address : 'Shop No. 12, Galleria Mall, Hiranandani Gardens, Powai, Mumbai - 400076'}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '10px',
                marginTop: '6px',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}>
                <Phone size={14} /> <span>Coordinator: {dropPoint ? dropPoint.phone : '+91 98765 43210'}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5C6C62', lineHeight: '1.4' }}>
              * Orders are collective at this address. Pickup orders within 7 days of confirmation to avoid cancellation.
            </p>
          </div>
        </div>

        {/* Right Column: Group Status, Progress and Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Panel */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>GROUP DEAL STATUS</span>
              <Badge status={group.status} />
            </div>

            <ProgressBar current={group.currentMembers} target={group.targetMembers} />

            {/* Savings Indicator */}
            <div style={{
              backgroundColor: 'var(--color-cream)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 165, 40, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>Locked Savings:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>₹{group.savings} per item</span>
            </div>

            {/* First Member Qty 5 Bonus Tip */}
            <div style={{
              backgroundColor: '#ECFDF5',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #10B981',
              fontSize: '0.82rem',
              color: '#065F46',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              👑 First member ordering min 5 quantity gets an extra 10% bonus discount!
            </div>

            {/* Timers */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: '#5C6C62' }}>
              <Clock size={16} /> <span>Ends in <strong>23 hours, 45 minutes</strong></span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: remaining > 0 ? '1fr 1fr' : '1fr', gap: '16px' }}>
              {remaining > 0 ? (
                <>
                  {isMember ? (
                    <div style={{
                      padding: '10px 16px',
                      backgroundColor: 'var(--color-green-very-light)',
                      color: 'var(--color-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      border: '1px solid rgba(24, 83, 56, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      You are a Member
                    </div>
                  ) : (
                    <Button 
                      onClick={() => joinGroupDirectly(group.id)}
                      variant="primary"
                    >
                      JOIN GROUP
                    </Button>
                  )}
                  <Button 
                    onClick={handleInviteSimulate}
                    variant="secondary"
                  >
                    Invite Friend (Simulate)
                  </Button>
                </>
              ) : (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-green-light)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={16} /> Group Completed & Confirmed!
                </div>
              )}
            </div>
            
            {remaining > 0 && (
              <Button onClick={handleShare} variant="text" size="sm">
                <Share2 size={14} style={{ marginRight: '6px' }} /> Copy Invite Link to Share
              </Button>
            )}
          </div>

          {/* Members List */}
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
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--color-primary)' }} /> Group Members ({group.currentMembers} joined)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {group.memberNames.map((name, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-off-white)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-green-light)',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem'
                    }}>
                      {name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <UserCheck size={12} /> Joined
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default GroupDetail;
