import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Tag,
  TrendingDown,
  RefreshCw,
  Building2,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    groups,
    categories,
    kycApplications,
    approveSellerKyc,
    rejectSellerKyc,
    addCategory,
    addAdminProduct,
    approveProduct,
    rejectProduct,
    updateGroupPriceByAdmin,
    processGroupRefund,
    setPage
  } = useHomekart();

  const [activeTab, setActiveTab] = useState<'sellerKyc' | 'approvals' | 'direct' | 'categories' | 'pricing' | 'refunds'>('sellerKyc');

  // Direct Admin Product Form State
  const [adminProd, setAdminProd] = useState({
    name: '',
    description: '',
    category: categories[1] || 'Staples',
    originalPrice: '',
    groupPrice: '',
    moq: '20',
    imageUrl: ''
  });

  // Category Add State
  const [newCatName, setNewCatName] = useState('');

  // Dynamic Price Modification State: { [productId]: priceInput }
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});

  const pendingKycApps = kycApplications.filter(a => a.status === 'pending');
  const pendingProducts = products.filter(p => p.approvalStatus === 'pending');
  const approvedProducts = products.filter(p => p.approvalStatus === 'approved');

  const handleAdminAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProd.name || !adminProd.originalPrice || !adminProd.groupPrice) return;

    await addAdminProduct({
      name: adminProd.name,
      description: adminProd.description,
      category: adminProd.category,
      originalPrice: Number(adminProd.originalPrice),
      groupPrice: Number(adminProd.groupPrice),
      moq: Number(adminProd.moq),
      imageUrl: adminProd.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
    });

    setAdminProd({
      name: '',
      description: '',
      category: categories[1] || 'Staples',
      originalPrice: '',
      groupPrice: '',
      moq: '20',
      imageUrl: ''
    });
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName);
    setNewCatName('');
  };

  const handlePriceUpdate = async (productId: string) => {
    const val = Number(priceInputs[productId]);
    if (val && val > 0) {
      await updateGroupPriceByAdmin(productId, val);
      setPriceInputs(prev => ({ ...prev, [productId]: '' }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
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
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={28} style={{ color: '#38BDF8' }} />
          </div>
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Admin Control Center
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '4px' }}>
              Seller KYC Approvals, Supplier Product Review, Direct Publishing & System Controls
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setPage('shop')}>
            View Live Shop
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid var(--color-border)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'sellerKyc', label: `Seller KYC Approvals (${pendingKycApps.length})`, icon: Building2 },
          { id: 'approvals', label: `Product Approvals (${pendingProducts.length})`, icon: CheckCircle2 },
          { id: 'direct', label: 'Direct Product List', icon: PlusCircle },
          { id: 'categories', label: 'Category Add', icon: Layers },
          { id: 'pricing', label: 'Cart Dynamic Pricing', icon: TrendingDown },
          { id: 'refunds', label: 'Refund Manager', icon: RefreshCw }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: isActive ? 'var(--color-primary)' : '#5C6C62',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--color-green-very-light)' : 'transparent',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: SELLER KYC APPROVALS */}
      {activeTab === 'sellerKyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Pending Seller KYC Applications ({pendingKycApps.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
                Review buyer applications to become sellers. Approving a KYC promotes the Buyer to Seller role.
              </p>
            </div>
          </div>

          {pendingKycApps.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              padding: '48px',
              textAlign: 'center',
              color: '#5C6C62'
            }}>
              <CheckCircle2 size={40} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
              <h3>No Pending Seller KYC Applications</h3>
              <p>All buyer seller requests have been processed.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {pendingKycApps.map(app => (
                <div key={app.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{app.companyName}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: '2px 0 0 0' }}>
                        Applicant: <strong>{app.applicantName}</strong> (+91 {app.phone})
                      </p>
                    </div>
                    <Badge status="Pending Review" />
                  </div>

                  <div style={{
                    backgroundColor: 'var(--color-off-white)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <div><strong>GSTIN:</strong> <code style={{ fontFamily: 'monospace' }}>{app.gstin}</code></div>
                    <div><strong>PAN Card:</strong> <code style={{ fontFamily: 'monospace' }}>{app.panNumber}</code></div>
                    <div><strong>Address:</strong> {app.businessAddress}</div>
                    <div><strong>Bank Payout:</strong> {app.bankName} | Acc: {app.accountNumber} | IFSC: {app.ifscCode}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <Button
                      variant="primary"
                      style={{ flex: 1 }}
                      onClick={() => approveSellerKyc(app.id)}
                    >
                      <CheckCircle2 size={16} /> Approve & Promote to Seller
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                      onClick={() => rejectSellerKyc(app.id)}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SUPPLIER APPROVALS */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Pending Supplier Product Listings ({pendingProducts.length})
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#5C6C62' }}>
              Supplier products are hidden from Buyers until Admin approves.
            </span>
          </div>

          {pendingProducts.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              padding: '48px',
              textAlign: 'center',
              color: '#5C6C62'
            }}>
              <CheckCircle2 size={40} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
              <h3>All Caught Up!</h3>
              <p>There are currently no supplier products waiting for approval.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {pendingProducts.map(p => (
                <div key={p.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-green-very-light)',
                        color: 'var(--color-primary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        alignSelf: 'flex-start'
                      }}>
                        {p.category}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#5C6C62' }}>
                        <Building2 size={14} />
                        <span>Company: <strong>{p.companyName || 'Supplier'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#3A4B40', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--color-off-white)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ color: '#5C6C62' }}>Original</div>
                      <div style={{ textDecoration: 'line-through' }}>₹{p.originalPrice}</div>
                    </div>
                    <div>
                      <div style={{ color: '#5C6C62' }}>Group Price</div>
                      <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>₹{p.groupPrice}</div>
                    </div>
                    <div>
                      <div style={{ color: '#5C6C62' }}>MOQ Target</div>
                      <div style={{ fontWeight: 700 }}>{p.moq} Units</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <Button
                      variant="primary"
                      style={{ flex: 1 }}
                      onClick={() => approveProduct(p.id)}
                    >
                      <CheckCircle2 size={16} /> Approve & Publish
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                      onClick={() => rejectProduct(p.id)}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT ADMIN PRODUCT LISTING */}
      {activeTab === 'direct' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '28px',
          maxWidth: '700px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <PlusCircle size={24} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Direct Admin Product Listing</h2>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
                Products listed directly by Admin skip approval and are immediately live on HomeKart.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Multigrain Wheat Flour 5kg"
                value={adminProd.name}
                onChange={e => setAdminProd({ ...adminProd, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Category *</label>
                <select
                  value={adminProd.category}
                  onChange={e => setAdminProd({ ...adminProd, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Minimum Order Qty (MOQ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="20"
                  value={adminProd.moq}
                  onChange={e => setAdminProd({ ...adminProd, moq: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Original MRP (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="499"
                  value={adminProd.originalPrice}
                  onChange={e => setAdminProd({ ...adminProd, originalPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Group Offer Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="349"
                  value={adminProd.groupPrice}
                  onChange={e => setAdminProd({ ...adminProd, groupPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Product Description</label>
              <textarea
                rows={3}
                placeholder="Product highlights, origin, specifications..."
                value={adminProd.description}
                onChange={e => setAdminProd({ ...adminProd, description: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Product Image Options */}
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

              {/* Option 1: File Upload */}
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
                        setAdminProd(prev => ({ ...prev, imageUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ fontSize: '0.8rem', color: '#3A4B40', width: '100%' }}
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
                  value={adminProd.imageUrl}
                  onChange={e => setAdminProd({ ...adminProd, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Live Preview */}
              {adminProd.imageUrl && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-green-light)'
                }}>
                  <img src={adminProd.imageUrl} alt="preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    ✓ Image Selected & Preview Ready
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" style={{ marginTop: '12px' }}>
              <Sparkles size={18} /> Publish Direct to Shop Now
            </Button>
          </form>
        </div>
      )}

      {/* TAB 3: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={22} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add New Category</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
              Created categories immediately appear in shop filter tabs and listing dropdowns.
            </p>

            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Dairy & Eggs"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <Button type="submit" variant="primary">
                <PlusCircle size={16} /> Add Category
              </Button>
            </form>
          </div>

          {/* List of current categories */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
              Active Product Categories ({categories.length - 1})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.filter(c => c !== 'All').map(cat => (
                <div key={cat} style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-green-very-light)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(24, 83, 56, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Tag size={14} />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DYNAMIC CART PRICING CONTROL */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Cart Filling & Dynamic Price Modification</h2>
            <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
              As Buyers add items and cart volume fills towards MOQ, Admin can dynamically reduce product/group prices.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {approvedProducts.map(p => {
              const matchingGroup = groups.find(g => g.productId === p.id);
              const currentFilled = matchingGroup ? matchingGroup.currentMembers : Math.floor((p.moq || 20) * 0.6);
              const targetMoq = p.moq || 20;
              const fillPct = Math.min(100, Math.round((currentFilled / targetMoq) * 100));

              return (
                <div key={p.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={p.imageUrl} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{p.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>Company: {p.companyName || 'HomeKart Direct'}</span>
                    </div>
                  </div>

                  {/* Cart Fill Visualizer */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span>Cart Filled: {currentFilled} / {targetMoq} MOQ</span>
                      <span style={{ color: 'var(--color-primary)' }}>{fillPct}% Filled</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-off-white)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${fillPct}%`, height: '100%', backgroundColor: fillPct >= 80 ? 'var(--color-accent)' : 'var(--color-primary)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* Current Prices */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', backgroundColor: 'var(--color-off-white)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: '#5C6C62' }}>Current Group Price: </span>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{p.groupPrice}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5C6C62' }}>Original MRP: </span>
                      <span style={{ textDecoration: 'line-through' }}>₹{p.originalPrice}</span>
                    </div>
                  </div>

                  {/* Admin Price Input */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder={`New Price (e.g. ₹${Math.round(p.groupPrice * 0.9)})`}
                      value={priceInputs[p.id] || ''}
                      onChange={e => setPriceInputs({ ...priceInputs, [p.id]: e.target.value })}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePriceUpdate(p.id)}
                    >
                      <TrendingDown size={14} /> Update Price
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: GROUP FAILURE & REFUND MANAGER */}
      {activeTab === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Group Unfilled Failure & Refund Manager</h2>
            <p style={{ fontSize: '0.85rem', color: '#5C6C62', margin: 0 }}>
              If a group cart does not fill to its target MOQ by deadline, Admin can initiate an automated full refund to all buyers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {groups.map(g => (
              <div key={g.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{g.productName}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>Group ID: #{g.id}</span>
                  </div>
                  <Badge status={g.status} />
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', color: '#3A4B40' }}>
                  <span>Current Members: <strong>{g.currentMembers} / {g.targetMembers}</strong></span>
                  <span>Price: <strong>₹{g.groupPrice}</strong></span>
                </div>

                {g.status !== 'Cancelled' ? (
                  <Button
                    variant="secondary"
                    style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)', marginTop: '6px' }}
                    onClick={() => processGroupRefund(g.id, 'Group cart failed to meet MOQ target by launch window.')}
                  >
                    <RefreshCw size={16} /> Mark Failed & Process Refunds
                  </Button>
                ) : (
                  <div style={{
                    backgroundColor: 'rgba(217, 83, 79, 0.1)',
                    color: 'var(--color-error)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={14} /> Refunds Processed & Order Status Updated
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
