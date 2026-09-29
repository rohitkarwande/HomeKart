import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import {
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';

export const SellerKyc: React.FC = () => {
  const { user, submitSellerKyc, setPage } = useHomekart();

  const [formData, setFormData] = useState({
    companyName: user?.name ? `${user.name} Trading Co.` : '',
    gstin: '27AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    businessAddress: 'Plot 15, APMC Market Yard, Navi Mumbai, Maharashtra 400703',
    bankName: 'HDFC Bank',
    accountNumber: '50100987654321',
    ifscCode: 'HDFC0001234'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);

  if (!user) {
    return (
      <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h2>Please log in to apply for Seller KYC</h2>
        <Button onClick={() => setPage('auth')} style={{ marginTop: '16px' }}>Go to Login</Button>
      </div>
    );
  }

  const currentStatus = isReapplying ? 'none' : (user.kycStatus || 'none');
  const app = user.kycApplication;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.gstin || !formData.panNumber || !formData.businessAddress) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSellerKyc(formData);
      setIsReapplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Back button */}
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

      {/* Top Hero Banner */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={30} style={{ color: '#38BDF8' }} />
          </div>
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Become a Verified Seller
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '4px' }}>
              Complete business KYC verification to unlock selling & MOQ product listings.
            </p>
          </div>
        </div>
      </div>

      {/* STATUS STATUS CARDS */}

      {/* 1. APPROVED STATUS */}
      {currentStatus === 'approved' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-green-light)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-green-very-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={36} style={{ color: 'var(--color-primary)' }} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              🎉 Seller KYC Approved!
            </h2>
            <p style={{ color: '#5C6C62', marginTop: '6px', fontSize: '0.95rem' }}>
              Congratulations <strong>{user.name}</strong>! Your account has been promoted to <strong>Verified Supplier</strong>.
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={() => setPage('supplier')}>
            <Sparkles size={18} /> Launch Supplier Portal & List Products
          </Button>
        </div>
      )}

      {/* 2. PENDING STATUS */}
      {currentStatus === 'pending' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #FCD34D',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={24} style={{ color: '#D97706' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E' }}>
                ⏳ Seller KYC Application Under Admin Review
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.85rem', margin: 0 }}>
                Submitted on {app?.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Today'}. Admin will verify your documents shortly.
              </p>
            </div>
          </div>

          {app && (
            <div style={{
              backgroundColor: '#FFFBEB',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              border: '1px solid #FDE68A',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div><strong style={{ color: '#78350F' }}>Company:</strong> {app.companyName}</div>
              <div><strong style={{ color: '#78350F' }}>GSTIN:</strong> {app.gstin}</div>
              <div><strong style={{ color: '#78350F' }}>PAN Number:</strong> {app.panNumber}</div>
              <div><strong style={{ color: '#78350F' }}>Bank:</strong> {app.bankName} ({app.ifscCode})</div>
            </div>
          )}
        </div>
      )}

      {/* 3. REJECTED STATUS */}
      {currentStatus === 'rejected' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #FCA5A5',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle size={32} style={{ color: 'var(--color-error)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-error)' }}>
                ❌ Seller KYC Application Rejected
              </h2>
              <p style={{ color: '#5C6C62', fontSize: '0.85rem', margin: 0 }}>
                {app?.rejectionReason || 'GST or business credentials did not pass verification.'}
              </p>
            </div>
          </div>

          <Button variant="secondary" onClick={() => setIsReapplying(true)}>
            Re-Submit Seller KYC Application
          </Button>
        </div>
      )}

      {/* 4. APPLICATION FORM (NONE STATUS) */}
      {currentStatus === 'none' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FileText size={24} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Fill Seller Business Credentials</h2>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
                Submit your registered company GSTIN, PAN, and payout bank account details for Admin verification.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Company Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Registered Business / Company Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Organics & Spices Pvt Ltd"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
              </div>
            </div>

            {/* GSTIN & PAN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="27AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Owner PAN Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Business Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Registered Business Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Complete warehouse or office address..."
                value={formData.businessAddress}
                onChange={e => setFormData({ ...formData, businessAddress: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical' }}
              />
            </div>

            {/* Bank Details Header */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CreditCard size={18} style={{ color: 'var(--color-primary)' }} /> Payout Bank Account Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank"
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>IFSC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="HDFC0001234"
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="50100987654321"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} style={{ marginTop: '12px' }}>
              <ShieldCheck size={18} /> {isSubmitting ? 'SUBMITTING KYC...' : 'SUBMIT SELLER KYC APPLICATION'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerKyc;
