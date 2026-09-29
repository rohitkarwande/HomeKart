import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Factory,
  PlusCircle,
  Building2,
  Package,
  Sparkles,
  Info
} from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const {
    products,
    categories,
    addSupplierProduct,
    setPage,
    user
  } = useHomekart();

  const [formData, setFormData] = useState({
    companyName: user?.name ? `${user.name} Trading Co.` : 'EcoGro Products Ltd',
    name: '',
    description: '',
    category: categories[1] || 'Staples',
    originalPrice: '',
    groupPrice: '',
    moq: '25',
    imageUrl: '',
    specifications: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Supplier's listings (all supplier products)
  const myProducts = products.filter(p => p.sellerRole === 'supplier' || p.submittedBy === (user?.name || 'Registered Supplier'));

  const filteredMyProducts = myProducts.filter(p => {
    if (filterStatus === 'pending') return p.approvalStatus === 'pending';
    if (filterStatus === 'approved') return p.approvalStatus === 'approved';
    if (filterStatus === 'rejected') return p.approvalStatus === 'rejected';
    return true;
  });

  const pendingCount = myProducts.filter(p => p.approvalStatus === 'pending').length;
  const approvedCount = myProducts.filter(p => p.approvalStatus === 'approved').length;
  const rejectedCount = myProducts.filter(p => p.approvalStatus === 'rejected').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName || !formData.originalPrice || !formData.groupPrice || !formData.moq) return;

    setIsSubmitting(true);
    try {
      await addSupplierProduct({
        companyName: formData.companyName,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        originalPrice: Number(formData.originalPrice),
        groupPrice: Number(formData.groupPrice),
        moq: Number(formData.moq),
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
        specifications: formData.specifications ? { 'Specs': formData.specifications } : { 'Company': formData.companyName }
      });

      // Reset form title/desc
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        originalPrice: '',
        groupPrice: '',
        imageUrl: '',
        specifications: ''
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Supplier Banner */}
      <div style={{
        backgroundColor: '#1E293B',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Factory size={28} style={{ color: '#38BDF8' }} />
          </div>
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Supplier / Seller Portal
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '4px' }}>
              List products for group buying with Minimum Order Quantity (MOQ). Requires Admin Approval before going live.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={() => setPage('shop')}>
          Browse Live Market
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
        {/* Form Column */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PlusCircle size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>List New Product to Sell</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Company Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Company Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. PureFarm Organics Pvt Ltd"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}
                />
                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Cold-Pressed Groundnut Oil 5L"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Category & MOQ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  MOQ (Target Units) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="25"
                  value={formData.moq}
                  onChange={e => setFormData({ ...formData, moq: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* Prices */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Original Retail MRP (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="1200"
                  value={formData.originalPrice}
                  onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Group Bulk Offer Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="850"
                  value={formData.groupPrice}
                  onChange={e => setFormData({ ...formData, groupPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* Product Details & Specifications */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Product Details & Description
              </label>
              <textarea
                rows={3}
                placeholder="Key highlights, quality certifications, shelf life, weight..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Specifications */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Technical Specifications / Attributes
              </label>
              <input
                type="text"
                placeholder="e.g. 100% Pure, Zero Preservatives, Glass Bottle"
                value={formData.specifications}
                onChange={e => setFormData({ ...formData, specifications: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Product Image Option */}
            <div style={{
              backgroundColor: 'var(--color-off-white)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                📷 Product Image Options *
              </label>

              {/* Option 1: File Upload from local device */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#5C6C62', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Option A: Upload Image File from device
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    fontSize: '0.8rem',
                    color: '#3A4B40',
                    width: '100%'
                  }}
                />
              </div>

              {/* Option 2: Image URL input */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#5C6C62', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Option B: Or paste Web Image URL
                </span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Option 3: Sample Preset Quick Select */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#5C6C62', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Option C: Or click sample preset image
                </span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {[
                    { label: 'Organics', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' },
                    { label: 'Ghee/Oil', url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80' },
                    { label: 'Herbal', url: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500&auto=format&fit=crop&q=80' },
                    { label: 'Gadget', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: formData.imageUrl === preset.url ? 'var(--color-primary)' : '#FFFFFF',
                        color: formData.imageUrl === preset.url ? '#FFFFFF' : 'var(--color-dark)',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {formData.imageUrl && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-green-light)'
                }}>
                  <img src={formData.imageUrl} alt="preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    ✓ Image Selected & Preview Ready
                  </span>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: 'var(--color-green-very-light)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(24, 83, 56, 0.15)',
              fontSize: '0.8rem',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>After submitting, your product will be reviewed by Admin before appearing in the Buyer shop.</span>
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
              <Sparkles size={18} /> Submit Listing for Admin Approval
            </Button>
          </form>
        </div>

        {/* My Listings Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Product Listings ({myProducts.length})</h2>
            <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: '0 0 12px 0' }}>
              Track approval status of your submitted bulk listings.
            </p>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${myProducts.length})` },
                { id: 'pending', label: `⏳ Pending (${pendingCount})` },
                { id: 'approved', label: `✅ Approved (${approvedCount})` },
                { id: 'rejected', label: `❌ Rejected (${rejectedCount})` }
              ].map(pill => {
                const isActive = filterStatus === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setFilterStatus(pill.id as any)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-primary)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--color-dark)'
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredMyProducts.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              padding: '40px',
              textAlign: 'center',
              color: '#5C6C62'
            }}>
              <Package size={36} style={{ marginBottom: '8px', color: '#8C9B90' }} />
              <h4>No Listings Found</h4>
              <p style={{ fontSize: '0.85rem' }}>
                {myProducts.length === 0
                  ? 'Fill in the product details form on the left to submit your first listing for Admin review.'
                  : `No listings match the selected status "${filterStatus}".`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredMyProducts.map(p => {
                const isApproved = p.approvalStatus === 'approved';
                const isPending = p.approvalStatus === 'pending';
                return (
                  <div key={p.id} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>{p.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{p.companyName} · {p.category}</span>
                        </div>
                      </div>

                      {/* Approval Badge */}
                      <Badge status={isApproved ? 'Approved & Live' : isPending ? 'Pending Admin Approval' : 'Rejected'} />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--color-off-white)',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}>
                      <span>MRP: <del>₹{p.originalPrice}</del></span>
                      <span>Offer: <strong style={{ color: 'var(--color-primary)' }}>₹{p.groupPrice}</strong></span>
                      <span>MOQ: <strong>{p.moq} units</strong></span>
                    </div>

                    {isApproved && (
                      <button
                        onClick={() => setPage('product', { id: p.id })}
                        style={{
                          alignSelf: 'flex-end',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-green-very-light)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-green-light)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        👁️ View in Live Market
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
