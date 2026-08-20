import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { ArrowLeft, Save, Bell, Smartphone, Palette } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateProfile, setPage, dropPoints, selectedDropPoint, setSelectedDropPoint, addNotification } = useHomekart();

  // Redirect if logged out
  if (!user) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>Please log in to view settings</h2>
        <Button onClick={() => setPage('auth')} style={{ marginTop: '16px' }}>Go to Login</Button>
      </div>
    );
  }

  // Profile Edit fields
  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile);
  
  // Custom Settings mock states
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(true);
  const [emailNews, setEmailNews] = useState(false);
  const [appAlerts, setAppAlerts] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(async () => {
      const success = await updateProfile(name);
      setIsSaving(false);
      
      if (success) {
        addNotification('Settings saved successfully!', 'success');
        setPage('profile');
      } else {
        addNotification('Failed to update profile settings.', 'error');
      }
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* Back CTA */}
      <div>
        <button 
          onClick={() => setPage('profile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: '#5C6C62' }}>Manage your profile details and notifications.</p>
      </div>

      {/* Profile Details Edit Card */}
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
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} style={{ color: 'var(--color-primary)' }} /> Edit Profile Info
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: 'var(--color-off-white)'
              }}
              disabled
              title="Mobile number cannot be changed"
            />
            <span style={{ fontSize: '0.75rem', color: '#8C9B90', marginTop: '4px', display: 'block' }}>
              * Phone number is verified and tied to active orders.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Preferred Neighborhood Drop Point
            </label>
            <select
              value={selectedDropPoint?.id || ''}
              onChange={(e) => {
                const dp = dropPoints.find(d => d.id === e.target.value);
                if (dp) setSelectedDropPoint(dp);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {dropPoints.map(dp => (
                <option key={dp.id} value={dp.id}>
                  {dp.name} ({dp.area})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Configuration */}
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
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--color-primary)' }} /> Notification Channels
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'WhatsApp Notifications', desc: 'Receive group deal confirmation and order arrival messages directly on WhatsApp.', checked: whatsappNotifs, onChange: setWhatsappNotifs },
            { label: 'SMS Notifications', desc: 'Receive transaction logs and pickup reminders via mobile network messages.', checked: smsNotifs, onChange: setSmsNotifs },
            { label: 'Push & App Alerts', desc: 'Show visual banner alerts inside the browser dashboard feed.', checked: appAlerts, onChange: setAppAlerts },
            { label: 'Email Newsletter & Promos', desc: 'Receive weekly bulk savings roundups and referral promo codes.', checked: emailNews, onChange: setEmailNews }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-dark)' }}>{item.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* App Preferences */}
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
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} style={{ color: 'var(--color-primary)' }} /> Visual Preferences
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Theme Selection
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="light">Light Mode (Default)</option>
              <option value="dark">Dark Mode (Experimental)</option>
              <option value="system">Use System Settings</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Display Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          fullWidth={true}
          size="lg"
        >
          <Save size={18} style={{ marginRight: '8px' }} />
          {isSaving ? 'SAVING CHANGES...' : 'SAVE SETTINGS'}
        </Button>
      </div>

    </div>
  );
};

export default Settings;
