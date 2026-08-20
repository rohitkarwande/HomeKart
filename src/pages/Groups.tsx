import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Clock, MapPin, Sparkles, UserPlus } from 'lucide-react';

export const Groups: React.FC = () => {
  const { 
    groups, 
    joinGroupDirectly, 
    simulateFriendJoin, 
    setPage,
    addNotification,
    user
  } = useHomekart();

  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'almost-full' | 'confirmed' | 'my'>('all');

  const filteredGroups = groups.filter(grp => {
    if (activeFilter === 'my') {
      return grp.memberNames.includes(user?.name || '') || grp.memberNames.includes('You');
    }
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return grp.status === 'Open' || grp.status === 'Joining';
    if (activeFilter === 'almost-full') return grp.status === 'Almost Full';
    if (activeFilter === 'confirmed') return grp.status === 'Confirmed' || grp.status === 'Supplier Confirmed' || grp.status === 'Ready for Pickup';
    return true;
  });

  const handleInviteSimulate = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    simulateFriendJoin(groupId);
    addNotification('A friend joined the group! Progress updated.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Active Group Deals
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Join a group in your area to save. Or start a group by browsing products and purchasing at group price.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'all', label: 'All Active' },
          { id: 'my', label: 'My Groups' },
          { id: 'open', label: 'Open Groups' },
          { id: 'almost-full', label: 'Almost Full' },
          { id: 'confirmed', label: 'Confirmed Groups' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            style={{
              padding: '12px 4px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeFilter === tab.id ? 'var(--color-primary)' : '#5C6C62',
              borderBottom: activeFilter === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRadius: 0,
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups List */}
      {filteredGroups.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredGroups.map(grp => {
            return (
              <div
                key={grp.id}
                onClick={() => setPage('groupDetail', { id: grp.id })}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)'
                }}
                className="group-card-lift"
              >
                {/* Header status and timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge status={grp.status} />
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#5C6C62',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} /> 24h Left
                  </span>
                </div>

                {/* Product Section */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img
                    src={grp.productImage}
                    alt={grp.productName}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 700,
                      lineHeight: '1.4',
                      color: 'var(--color-dark)'
                    }}>
                      {grp.productName}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>₹{grp.groupPrice}</span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', fontSize: '0.8rem' }}>₹{grp.originalPrice}</span>
                      <span style={{ color: 'var(--color-green-bright)', fontSize: '0.75rem', fontWeight: 700 }}>Save ₹{grp.savings}</span>
                    </div>
                  </div>
                </div>

                {/* Drop point info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: '#5C6C62',
                  backgroundColor: 'var(--color-off-white)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Drop point: {grp.dropPointName}
                  </span>
                </div>

                {/* Member Progress bar */}
                <ProgressBar current={grp.currentMembers} target={grp.targetMembers} />

                {/* Members Avatars preview */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', overflow: 'hidden' }}>
                    {grp.memberNames.slice(0, 3).map((name, i) => (
                      <div 
                        key={i} 
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: i === 0 ? 'var(--color-green-light)' : i === 1 ? 'var(--color-cream)' : 'var(--color-gray-light)',
                          color: 'var(--color-primary)',
                          border: '2px solid #FFFFFF',
                          marginLeft: i > 0 ? '-8px' : 0,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textTransform: 'uppercase'
                        }}
                      >
                        {name.charAt(0)}
                      </div>
                    ))}
                    {grp.memberNames.length > 3 && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        border: '2px solid #FFFFFF',
                        marginLeft: '-8px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        +{grp.memberNames.length - 3}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>
                    Joined: {grp.memberNames.join(', ')}
                  </span>
                </div>

                {/* Action panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: grp.status === 'Confirmed' || grp.status === 'Supplier Confirmed' ? '1fr' : '1fr 1fr',
                  gap: '12px',
                  marginTop: 'auto'
                }}>
                  {/* Join Group Button */}
                  {(grp.status === 'Open' || grp.status === 'Almost Full') && (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); joinGroupDirectly(grp.id); }}
                      variant="primary"
                      size="sm"
                    >
                      JOIN GROUP
                    </Button>
                  )}

                  {/* Simulate Join Button for demo */}
                  {(grp.status === 'Open' || grp.status === 'Almost Full') && (
                    <Button 
                      onClick={(e) => handleInviteSimulate(e, grp.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <UserPlus size={14} style={{ marginRight: '4px' }} /> Simulate Join
                    </Button>
                  )}

                  {/* If group is already unlocked */}
                  {(grp.status === 'Confirmed' || grp.status === 'Supplier Confirmed') && (
                    <div style={{
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      padding: '8px',
                      backgroundColor: 'var(--color-green-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <Sparkles size={14} /> Group Confirmed!
                    </div>
                  )}
                </div>

              </div>
            );
          })}
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
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '1.4rem' }}>No Active Groups</h3>
          <p style={{ color: '#5C6C62', maxWidth: '400px' }}>
            There are no groups matching the filter. You can easily start a new group by choosing a product and buying it at group price.
          </p>
          <Button onClick={() => setPage('shop')}>
            Browse Products
          </Button>
        </div>
      )}

      {/* Lift helper style */}
      <style>{`
        .group-card-lift:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
};
export default Groups;
