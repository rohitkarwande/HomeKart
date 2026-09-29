import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Smartphone, User, Lock, Mail, ShieldCheck } from 'lucide-react';

export const Auth: React.FC = () => {
  const { loginWithPhonePassword, registerUser, loginAdmin, setPage, pageParams } = useHomekart();

  const [authTab, setAuthTab] = useState<'user' | 'admin'>('user');
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('Sneha Sharma');
  const [mobile, setMobile] = useState('9999988888');
  const [password, setPassword] = useState('password123');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Vegetables & Fruits',
    'Tech Products'
  ]);

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('admin@homekart.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORY_OPTIONS = [
    { label: '🥦 Vegetables & Fruits', name: 'Vegetables & Fruits' },
    { label: '📱 Tech Products', name: 'Tech Products' },
    { label: '👕 Clothes & Fashion', name: 'Clothes & Fashion' },
    { label: '💅 Salon Products', name: 'Salon Products' },
    { label: '🌾 Staples & Groceries', name: 'Staples' },
    { label: '🏠 Home Essentials', name: 'Home Essentials' },
    { label: '🧀 Dairy & Bakery', name: 'Dairy & Bakery' },
    { label: '🍿 Snacks & Drinks', name: 'Snacks' }
  ];

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        if (selectedCategories.length === 0) {
          setError('Please pick at least 1 interested category to personalize your homepage.');
          setIsSubmitting(false);
          return;
        }
        await registerUser(name, mobile, password, selectedCategories);
      } else {
        await loginWithPhonePassword(mobile, password);
      }

      if (pageParams?.redirectPage) {
        setPage(pageParams.redirectPage, pageParams.redirectParams || {});
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setError('Please enter admin email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await loginAdmin(adminEmail, adminPassword);
      if (!ok) {
        setError('Invalid Admin credentials. Try admin@homekart.com / admin123');
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '40px auto',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: '32px',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }} className="animate-fade-in">
      
      {/* Brand logo header */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Logo size="md" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>
          {authTab === 'admin' ? 'System Admin Portal' : (isRegister ? 'Create Buyer Account' : 'Welcome to HomeKart')}
        </h2>
        <p style={{ color: '#5C6C62', fontSize: '0.85rem', marginTop: '6px' }}>
          {authTab === 'admin'
            ? 'Sign in with your administrator credentials'
            : (isRegister ? 'Join neighborhood buying groups to save big' : 'Enter phone & password to sign in')
          }
        </p>
      </div>

      {/* Auth Tab Picker Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#F8FAFC',
        padding: '6px',
        borderRadius: '12px',
        border: '1.5px solid #E2E8F0',
        gap: '6px'
      }}>
        <button
          type="button"
          onClick={() => { setAuthTab('user'); setError(''); }}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 800,
            border: authTab === 'user' ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
            cursor: 'pointer',
            backgroundColor: authTab === 'user' ? '#FFFFFF' : 'transparent',
            color: authTab === 'user' ? 'var(--color-primary)' : '#64748B',
            boxShadow: authTab === 'user' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          📱 Buyer / User
        </button>

        <button
          type="button"
          onClick={() => { setAuthTab('admin'); setError(''); }}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 800,
            border: authTab === 'admin' ? '1.5px solid #1E293B' : '1px solid #CBD5E1',
            cursor: 'pointer',
            backgroundColor: authTab === 'admin' ? '#1E293B' : 'transparent',
            color: authTab === 'admin' ? '#FFFFFF' : '#64748B',
            boxShadow: authTab === 'admin' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          👑 System Admin
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(194, 64, 47, 0.08)',
          color: 'var(--color-error)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 600,
          border: '1px solid rgba(194, 64, 47, 0.15)'
        }}>
          {error}
        </div>
      )}

      {/* USER AUTH FORM */}
      {authTab === 'user' ? (
        <form onSubmit={handleUserAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User Mode Button Card Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: !isRegister ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                backgroundColor: !isRegister ? 'var(--color-primary)' : '#FFFFFF',
                color: !isRegister ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                boxShadow: !isRegister ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              🔒 Sign In
            </button>

            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: isRegister ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                backgroundColor: isRegister ? 'var(--color-primary)' : '#FFFFFF',
                color: isRegister ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                boxShadow: isRegister ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📝 Create Account
            </button>
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Mobile Number *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.9rem',
                color: 'var(--color-dark)',
                fontWeight: 600
              }}>
                +91
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9999988888"
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 48px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Smartphone size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
            </div>
          </div>

          {isRegister && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
                  🎯 Interested Categories *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {selectedCategories.length} selected
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0 }}>
                Products from your picked categories (e.g. Vegetables, Tech, Clothes) will be prioritized at the front of your Homepage!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {CATEGORY_OPTIONS.map(cat => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? 'var(--color-green-light)' : '#FFFFFF',
                        color: isSelected ? 'var(--color-primary)' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {cat.label} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button type="submit" fullWidth={true} size="lg" style={{ marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? 'AUTHENTICATING...' : (isRegister ? 'CREATE ACCOUNT & LOG IN' : 'SIGN IN')}
          </Button>

          {/* Account Action Switcher Card Box */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
              {isRegister ? 'Already registered with HomeKart?' : 'First time shopping on HomeKart?'}
            </span>
            {isRegister ? (
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-primary)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                🔒 SIGN IN TO EXISTING ACCOUNT
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-primary)',
                  backgroundColor: 'var(--color-green-light)',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                ✨ CREATE BUYER ACCOUNT & REGISTER
              </button>
            )}
          </div>

          <div style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: 'var(--color-off-white)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#5C6C62',
            textAlign: 'center'
          }}>
            💡 Want to sell products? Sign up as a Buyer first, then apply for <strong>Seller KYC Verification</strong> in your profile.
          </div>
        </form>
      ) : (
        /* ADMIN AUTH FORM */
        <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Admin Email *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@homekart.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Admin Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="admin123"
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
            </div>
          </div>

          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '0.78rem',
            color: '#475569'
          }}>
            🔑 <strong>Demo Credentials:</strong><br />
            Email: <code style={{ backgroundColor: '#E2E8F0', padding: '1px 4px', borderRadius: '3px' }}>admin@homekart.com</code><br />
            Password: <code style={{ backgroundColor: '#E2E8F0', padding: '1px 4px', borderRadius: '3px' }}>admin123</code>
          </div>

          <Button type="submit" fullWidth={true} size="lg" style={{ marginTop: '4px', backgroundColor: '#1E293B', borderColor: '#1E293B' }} disabled={isSubmitting}>
            <ShieldCheck size={18} /> {isSubmitting ? 'VERIFYING ADMIN...' : 'LOG IN TO ADMIN CONTROL CENTER'}
          </Button>
        </form>
      )}

    </div>
  );
};
export default Auth;
