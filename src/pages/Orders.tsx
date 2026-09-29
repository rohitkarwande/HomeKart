import React, { useState } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  ArrowLeft, 
  MapPin, 
  UserPlus
} from 'lucide-react';

export const Orders: React.FC = () => {
  const {
    orders,
    products,
    cancelOrder,
    completeOrder,
    simulateFriendJoin,
    setPage,
    pageParams,
    groups
  } = useHomekart();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(pageParams?.id || null);

  React.useEffect(() => {
    if (pageParams?.id) {
      setSelectedOrderId(pageParams.id);
    } else {
      setSelectedOrderId(null);
    }
  }, [pageParams]);

  const handleBackToList = () => {
    setPage('orders');
  };

  const handleSimulateJoin = (groupId: string) => {
    simulateFriendJoin(groupId);
  };

  const handleMarkAsPickedUp = async (orderId: string) => {
    await completeOrder(orderId);
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter(ord => {
    const status = ord.groupStatus.toLowerCase();
    const isCancel = status.includes('cancel') || status.includes('refund');
    const isComplete = status.includes('complete');

    if (activeTab === 'completed') {
      return isComplete && !isCancel;
    } else if (activeTab === 'cancelled') {
      return isCancel;
    } else { // active
      return !isComplete && !isCancel;
    }
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // DETAILS VIEW
  if (selectedOrder) {
    const isGroupBuy = selectedOrder.items[0]?.isGroupBuy;
    const associatedGroup = groups.find(g => g.id === selectedOrder.groupId);

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <button 
            onClick={handleBackToList}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: 'var(--color-primary)',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {/* Left Column: Order details & interactive actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>ORDER NUMBER</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>#{selectedOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', color: '#5C6C62' }}>DATE PLACED</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(selectedOrder.date).toLocaleDateString()}</span>
              </div>

              {/* Refund Notice Card if Refunded */}
              {(selectedOrder.paymentStatus === 'Refunded' || selectedOrder.refundDetails || selectedOrder.groupStatus.includes('Cancel')) && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 800, fontSize: '0.95rem' }}>
                    💸 Money Refunded
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: 0 }}>
                    Amount of <strong>₹{selectedOrder.refundDetails?.amount || selectedOrder.total}</strong> has been refunded back to your original payment method.
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#7F1D1D' }}>
                    Reason: {selectedOrder.refundDetails?.reason || 'Group cart MOQ target was not filled within the launch window.'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7F1D1D', fontFamily: 'monospace' }}>
                    Txn ID: {selectedOrder.refundDetails?.transactionId || 'REF-98410283'}
                  </div>
                </div>
              )}

              {/* Delivery Estimation Box */}
              {!selectedOrder.groupStatus.includes('Cancel') && !selectedOrder.groupStatus.includes('Refund') && (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-green-very-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    🚚
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Estimated Order Delivery
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      📅 1 October to 7 October
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Order confirmed after launching. Delivery within a week!
                    </div>
                  </div>
                </div>
              )}

              {/* Items listing */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {((selectedOrder.items && selectedOrder.items.length > 0) ? selectedOrder.items : [{
                  productId: 'default',
                  productName: 'HomeKart Group Deal Item',
                  productImage: '',
                  quantity: 1,
                  originalPrice: selectedOrder.total,
                  groupPrice: selectedOrder.total,
                  isGroupBuy: true
                }]).map((item, idx) => {
                  const matchedProd = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName?.toLowerCase());
                  const defaultProd = products[idx % products.length] || products[0];

                  const imgSrc = (item.productImage && item.productImage.trim().length > 0 && !item.productImage.includes('photo-1542838132-92c53300491e'))
                    ? item.productImage
                    : (matchedProd?.imageUrl || defaultProd?.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80');

                  const prodName = (item.productName && !item.productName.includes('Bulk Group') && item.productName !== 'HomeKart Product')
                    ? item.productName
                    : (matchedProd?.name || defaultProd?.name || 'Homekart Product');

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img 
                        src={imgSrc} 
                        alt={prodName} 
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = defaultProd?.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{prodName}</p>
                        <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>Qty: {item.quantity || 1} · {item.isGroupBuy ? 'Group Price' : 'Regular Price'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals panel */}
              <div style={{
                backgroundColor: 'var(--color-off-white)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.savings > 0 && (
                  <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 600 }}>
                    <span>Savings:</span>
                    <span>-₹{selectedOrder.savings}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontWeight: 800 }}>
                  <span>Total Paid:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{selectedOrder.total}</span>
                </div>
              </div>

              {/* Interactive buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {/* Cancel option */}
                {selectedOrder.pickupStatus === 'Pending' && !selectedOrder.groupStatus.includes('Cancel') && !selectedOrder.groupStatus.includes('Refund') && (
                  <Button 
                    onClick={() => cancelOrder(selectedOrder.id)}
                    variant="secondary"
                    fullWidth={true}
                  >
                    Cancel Order
                  </Button>
                )}

                {/* Simulate join option if group buy */}
                {isGroupBuy && selectedOrder.groupId && associatedGroup && (associatedGroup.status === 'Open' || associatedGroup.status === 'Almost Full') && (
                  <Button
                    onClick={() => handleSimulateJoin(selectedOrder.groupId!)}
                    variant="primary"
                    fullWidth={true}
                  >
                    <UserPlus size={16} style={{ marginRight: '6px' }} /> Invite Friends (Simulate Join)
                  </Button>
                )}

                {/* Pickup action button if ready */}
                {selectedOrder.pickupStatus === 'Ready for Pickup' && (
                  <Button
                    onClick={() => handleMarkAsPickedUp(selectedOrder.id)}
                    variant="primary"
                    fullWidth={true}
                  >
                    Mark as Collected / Picked Up
                  </Button>
                )}
              </div>
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
              <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)' }} /> Pickup Drop Point
              </h4>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedOrder.dropPoint.name}</p>
              <p style={{ fontSize: '0.85rem', color: '#5C6C62' }}>{selectedOrder.dropPoint.address}</p>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Coordinator helpline: {selectedOrder.dropPoint.phone}
              </div>
            </div>
          </div>

          {/* Right Column: Vertical status timeline */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Order Tracking Timeline</h3>

            {/* Vertical timeline components */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {selectedOrder.timeline.map((item, idx) => {
                const isCompleted = item.completed;
                const isLast = idx === selectedOrder.timeline.length - 1;

                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', minHeight: '80px', position: 'relative' }}>
                    
                    {/* Connecting line */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        bottom: 0,
                        width: '2px',
                        backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-border)',
                        zIndex: 1
                      }} />
                    )}

                    {/* Timeline dot */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'var(--color-primary)' : '#FFFFFF',
                      border: `2px solid ${isCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {isCompleted ? '✓' : ''}
                    </div>

                    {/* Text Details */}
                    <div>
                      <h4 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-ui)',
                        color: isCompleted ? 'var(--color-dark)' : '#8C9B90'
                      }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#5C6C62' }}>{item.date}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LISTINGS VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          My Orders
        </h1>
        <p style={{ color: '#5C6C62' }}>Track the progress of your neighborhood group deals.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'active', label: 'Active Deals' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled / Refunded' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 4px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeTab === tab.id ? 'var(--color-primary)' : '#5C6C62',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRadius: 0,
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map(ord => (
            <div 
              key={ord.id}
              onClick={() => setPage('orders', { id: ord.id })}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              className="order-card-hover"
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-dark)' }}>
                    Order #{ord.id.startsWith('HK') ? ord.id : ('HK-' + ord.id.slice(0, 6).toUpperCase())}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#8C9B90' }}>· {new Date(ord.date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge status={ord.groupStatus} />
                  {ord.pickupStatus === 'Ready for Pickup' && <Badge status="Ready for Pickup" />}
                </div>
              </div>

              {/* Items listing */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
                {((ord.items && ord.items.length > 0) ? ord.items : [{
                  productId: 'default',
                  productName: 'HomeKart Group Deal Item',
                  productImage: '',
                  quantity: 1,
                  originalPrice: ord.total,
                  groupPrice: ord.total,
                  isGroupBuy: true
                }]).map((item, i) => {
                  const matchedProd = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName?.toLowerCase());
                  const defaultProd = products[i % products.length] || products[0];

                  const imgSrc = (item.productImage && item.productImage.trim().length > 0 && !item.productImage.includes('photo-1542838132-92c53300491e'))
                    ? item.productImage
                    : (matchedProd?.imageUrl || defaultProd?.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80');

                  const prodName = (item.productName && !item.productName.includes('Bulk Group') && item.productName !== 'HomeKart Product')
                    ? item.productName
                    : (matchedProd?.name || defaultProd?.name || 'Homekart Product');

                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img 
                        src={imgSrc} 
                        alt={prodName} 
                        style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = defaultProd?.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)' }}>
                        {prodName} (x{item.quantity || 1})
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Lower info & Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#5C6C62' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>Pickup: {ord.dropPoint.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {ord.pickupStatus === 'Pending' && !ord.groupStatus.includes('Cancel') && !ord.groupStatus.includes('Refund') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOrder(ord.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                  <div style={{ fontWeight: 700 }}>
                    Total Paid: <span style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>₹{ord.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          <h3 style={{ fontSize: '1.4rem' }}>No Orders Found</h3>
          <p style={{ color: '#5C6C62' }}>You have no orders in this tab. Start browsing our store to find savings.</p>
          <Button onClick={() => setPage('shop')}>Explore Products</Button>
        </div>
      )}

      <style>{`
        .order-card-hover:hover {
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </div>
  );
};
export default Orders;
