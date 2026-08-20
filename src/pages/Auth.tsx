import React, { useState, useEffect } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { KeyRound, Smartphone, User } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, verifyOtp, setPage, pageParams } = useHomekart();

  const step = pageParams?.step === 2 ? 2 : 1;
  const [name, setName] = useState('Sneha Sharma');
  const [mobile, setMobile] = useState('9999988888');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || mobile.length < 10) {
      setError('Please provide a valid name and mobile number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(name, mobile);
      setResendTimer(30);
      setPage('auth', { step: 2, redirectPage: pageParams?.redirectPage, redirectParams: pageParams?.redirectParams });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check the mobile number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    // Simulator-only expired validation
    if (otp === '000000') {
      setError('This OTP has expired. Please click Resend OTP.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const isValid = await verifyOtp(otp);
      if (isValid) {
        if (pageParams?.redirectPage) {
          setPage(pageParams.redirectPage, pageParams.redirectParams || {});
        } else {
          setPage('home');
        }
      } else {
        setError('Invalid OTP code. Try entering "123456".');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await login(name, mobile);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div style={{
      maxWidth: '400px',
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
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-ui)', fontWeight: 800 }}>
          {step === 1 ? 'Login or Sign Up' : 'OTP Verification'}
        </h2>
        <p style={{ color: '#5C6C62', fontSize: '0.85rem', marginTop: '6px' }}>
          {step === 1 
            ? 'Enter your mobile details to join active buying groups'
            : `Enter the 6-digit verification code sent to +91 ${mobile}`
          }
        </p>
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

      {/* Step 1: Name and Mobile */}
      {step === 1 ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Full Name
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

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              Mobile Number
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

          <Button type="submit" fullWidth={true} size="lg" style={{ marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? 'PROCESSING...' : 'CONTINUE'}
          </Button>
        </form>
      ) : (
        /* Step 2: OTP Entry */
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>
              One-Time Password (OTP)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.25em',
                  outline: 'none'
                }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#5C6C62', display: 'block', marginTop: '6px' }}>
              * Enter default code <strong>123456</strong> for testing verification.
            </span>
          </div>

          {/* Resend OTP countdown/button */}
          <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.8rem', color: '#5C6C62', marginTop: '4px' }}>
            {resendTimer > 0 ? (
              <span>Resend OTP in <strong>{resendTimer}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Resend OTP
              </button>
            )}
          </div>

          <Button type="submit" fullWidth={true} size="lg" style={{ marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? 'VERIFYING...' : 'VERIFY & LOGIN'}
          </Button>

          <button 
            type="button" 
            onClick={() => setPage('auth', { step: 1, redirectPage: pageParams?.redirectPage, redirectParams: pageParams?.redirectParams })}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            Change mobile details
          </button>
        </form>
      )}

    </div>
  );
};
export default Auth;
