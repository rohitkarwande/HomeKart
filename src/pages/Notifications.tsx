import React, { useEffect } from 'react';
import { useHomekart } from '../store/homekartStore';
import { BellOff, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { 
    notifications, 
    markNotificationsAsRead 
  } = useHomekart();

  // Mark all read on mount
  useEffect(() => {
    markNotificationsAsRead();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Notifications
          </h1>
          <p style={{ color: '#5C6C62' }}>Stay updated on your group completions and pickup alerts.</p>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(notif => {
            // Pick color indicators
            let Icon = Info;
            let iconColor = 'var(--color-primary)';
            let borderColor = 'var(--color-border)';
            let bgColor = '#FFFFFF';

            if (notif.type === 'success') {
              Icon = CheckCircle;
              iconColor = 'var(--color-green-bright)';
              borderColor = 'rgba(46, 157, 99, 0.2)';
              bgColor = 'var(--color-green-very-light)';
            } else if (notif.type === 'warning') {
              Icon = AlertTriangle;
              iconColor = 'var(--color-accent)';
              borderColor = 'rgba(239, 165, 40, 0.2)';
              bgColor = 'var(--color-cream)';
            } else if (notif.type === 'error') {
              Icon = XCircle;
              iconColor = 'var(--color-error)';
              borderColor = 'rgba(194, 64, 47, 0.2)';
              bgColor = 'rgba(194, 64, 47, 0.05)';
            }

            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {/* Unread circle */}
                {!notif.read && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%'
                  }} />
                )}

                {/* Icon wrapper */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>

                {/* Message detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    fontWeight: notif.read ? 500 : 700,
                    color: 'var(--color-dark)'
                  }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#8C9B90' }}>{notif.timestamp}</span>
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
          padding: '80px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-gray-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8C9B90'
          }}>
            <BellOff size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>You're all caught up</h3>
            <p style={{ color: '#5C6C62' }}>We'll notify you here when your groups update or packages arrive.</p>
          </div>
        </div>
      )}

    </div>
  );
};
export default Notifications;
