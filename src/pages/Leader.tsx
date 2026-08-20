import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Award, 
  MapPin, 
  IndianRupee, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  CheckCircle,
  FileText,
  Clock,
  XCircle
} from 'lucide-react';

export const Leader: React.FC = () => {
  const {
    leaderProfile,
    dropPoints,
    submitLeaderApplication,
    approveLeaderApplication,
    rejectLeaderApplication,
    resetLeaderApplication,
    withdrawLeaderEarnings,
    addNotification
  } = useHomekart();

  // Form inputs
  const [formData, setFormData] = useState({
    name: leaderProfile.name || '',
    mobile: leaderProfile.mobile || '',
    area: leaderProfile.area || '',
    preferredDropPointId: leaderProfile.preferredDropPointId || dropPoints[1].id,
    experience: '',
    availability: '10-20 hours/week'
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.area) {
      alert('Please fill in all required fields.');
      return;
    }
    submitLeaderApplication({
      name: formData.name,
      mobile: formData.mobile,
      area: formData.area,
      preferredDropPointId: formData.preferredDropPointId
    });
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    const success = await withdrawLeaderEarnings(amt);
    if (success) {
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } else {
      alert('Insufficient available balance for withdrawal.');
    }
  };

  // Mock list of local drop point customer pickups for active leaders
  const mockCustomerPickups = [
    { customer: 'Rohan Mehta', items: 'Basmati Rice x2', total: 1198, paymentStatus: 'Paid', pickupStatus: 'Pending' },
    { customer: 'Aparna Sen', items: 'Smartwatch x1', total: 2199, paymentStatus: 'Paid', pickupStatus: 'Pending' },
    { customer: 'Karan Malhotra', items: 'Tomatoes 1kg, Apples 1kg', total: 235, paymentStatus: 'Paid', pickupStatus: 'Collected' }
  ];

  // 1. APPLICATION FORM (INACTIVE STATUS)
  if (leaderProfile.status === 'Inactive') {
    return (
      <div className="animate-fade-in leader-grid-responsive" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        
        {/* Marketing Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-green-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', lineHeight: '1.2' }}>
            Become a Homekart Leader
          </h1>
          <p style={{ color: '#5C6C62', lineHeight: '1.6' }}>
            Homekart Leaders coordinate delivery and pickups at local Drop Points. By offering your home or shop as a collection hub, you help neighbors save together while earning a commission.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--color-dark)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Earn 5% - 8% commission on all drop point order volumes</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Free advertising and customer traffic to your local shop/address</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Help your neighborhood unlock the lowest group-buy pricing</span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--color-primary)' }} /> Leader Application
          </h3>

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>Preferred Area *</label>
              <input
                type="text"
                name="area"
                placeholder="e.g. Powai, Hiranandani"
                value={formData.area}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>Preferred Drop Point Hub *</label>
              <select
                name="preferredDropPointId"
                value={formData.preferredDropPointId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {dropPoints.map(dp => (
                  <option key={dp.id} value={dp.id}>{dp.name} ({dp.distance})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)', display: 'block', marginBottom: '6px' }}>Retail / Logistics Experience</label>
              <textarea
                name="experience"
                rows={3}
                placeholder="Describe any experience with stores, deliveries, or neighborhood committees..."
                value={formData.experience}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            <Button type="submit" fullWidth={true} size="lg" style={{ marginTop: '8px' }}>
              SUBMIT APPLICATION
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 2. REVIEW STAGE (PENDING / UNDER REVIEW)
  if (leaderProfile.status === 'Pending') {
    return (
      <div className="container animate-fade-in" style={{ padding: '48px 0', maxWidth: '600px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-cream)',
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={32} />
          </div>
          
          <div>
            <Badge status="UNDER REVIEW" />
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginTop: '12px', marginBottom: '8px' }}>
              Application Received!
            </h2>
            <p style={{ color: '#5C6C62', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Hello <strong>{leaderProfile.name}</strong>, your application to manage the drop point at <strong>{dropPoints.find(d => d.id === leaderProfile.preferredDropPointId)?.name}</strong> is currently being processed.
            </p>
            <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '16px' }}>
              * Demo: The application is configured to auto-approve in a few seconds! Stand by...
            </p>
          </div>

          {/* Simulator controls */}
          <div style={{
            display: 'flex',
            gap: '12px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            width: '100%',
            justifyContent: 'center'
          }}>
            <Button onClick={approveLeaderApplication} size="sm">
              Simulate Approve
            </Button>
            <Button onClick={rejectLeaderApplication} variant="secondary" size="sm">
              Simulate Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2.5 REJECTED STAGE
  if (leaderProfile.status === 'Rejected') {
    return (
      <div className="container animate-fade-in" style={{ padding: '48px 0', maxWidth: '600px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(235, 87, 87, 0.1)',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <XCircle size={32} />
          </div>
          
          <div>
            <Badge status="Rejected" />
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginTop: '12px', marginBottom: '8px' }}>
              Application Rejected
            </h2>
            <p style={{ color: '#5C6C62', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Thank you for your interest in becoming a Homekart Community Leader. Unfortunately, your application for preferred point <strong>{dropPoints.find(d => d.id === leaderProfile.preferredDropPointId)?.name}</strong> could not be approved at this time.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px'
          }}>
            <Button onClick={resetLeaderApplication} variant="primary">
              Re-apply as Community Leader
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LEADER DASHBOARD (ACTIVE STATUS)
  const selectedDP = dropPoints.find(d => d.id === leaderProfile.preferredDropPointId) || dropPoints[1];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Dashboard Welcome Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Leader Dashboard
          </h1>
          <p style={{ color: '#5C6C62' }}>
            Welcome back, <strong>{leaderProfile.name}</strong>. Manage your drop point parameters and track earnings.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button onClick={resetLeaderApplication} variant="secondary" size="sm">
            Simulate Reset
          </Button>
          <Badge status="ACTIVE LEADER" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px'
      }}>
        {[
          { label: 'Today\'s Orders', value: leaderProfile.todayOrders, icon: ShoppingBag },
          { label: 'Customers Served', value: leaderProfile.customers, icon: Users },
          { label: 'Total Earnings', value: `₹${leaderProfile.earnings}`, icon: IndianRupee },
          { label: 'Referral Rewards', value: `₹${leaderProfile.referralEarnings}`, icon: Award }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62', fontWeight: 600 }}>{kpi.label}</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>{kpi.value}</p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-green-very-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split section: Withdrawals & Pickups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '32px',
        alignItems: 'start'
      }} className="leader-split-responsive">
        
        {/* Left Column: Withdrawals & Drop Point Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Withdraw Panel */}
          <div style={{
            backgroundColor: 'var(--color-green-very-light)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(24, 83, 56, 0.1)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Available Balance</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                ₹{leaderProfile.balance}
              </span>
            </div>

            <Button 
              onClick={() => setShowWithdrawModal(true)}
              fullWidth={true}
            >
              WITHDRAW FUNDS <ArrowUpRight size={16} style={{ marginLeft: '4px' }} />
            </Button>
          </div>

          {/* Drop Point coordination */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary)' }} /> Managed Drop Point
            </h4>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedDP.name}</p>
            <p style={{ fontSize: '0.8rem', color: '#5C6C62', lineHeight: '1.4' }}>{selectedDP.address}</p>
          </div>
        </div>

        {/* Right Column: Customer collections list */}
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
          <h3 style={{ fontSize: '1.2rem' }}>Customer Pickups Queue</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockCustomerPickups.map((pickup, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-off-white)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pickup.customer}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#5C6C62', marginTop: '2px' }}>{pickup.items}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>
                    Total: ₹{pickup.total} · {pickup.paymentStatus}
                  </span>
                </div>
                
                <div>
                  {pickup.pickupStatus === 'Pending' ? (
                    <Button 
                      onClick={() => {
                        alert(`Marked ${pickup.customer}'s order as picked up!`);
                        addNotification(`Leader marked pickup complete for ${pickup.customer}.`, 'success');
                      }}
                      size="sm"
                    >
                      Collect
                    </Button>
                  ) : (
                    <Badge status="COLLECTED" />
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Withdrawal Dialog Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(14, 42, 28, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '28px',
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Withdraw Earnings</h3>
            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#5C6C62', display: 'block', marginBottom: '6px' }}>
                  Available Balance: ₹{leaderProfile.balance}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. ₹500)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="submit" fullWidth={true}>Confirm Withdrawal</Button>
                <Button onClick={() => setShowWithdrawModal(false)} variant="secondary" type="button" fullWidth={true}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .leader-grid-responsive,
          .leader-split-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Leader;
