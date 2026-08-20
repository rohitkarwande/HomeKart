import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Search, Users, Star, ArrowUpDown, Clock, Truck } from 'lucide-react';
import { getCountdownText } from '../utils/pricing';
import { ProgressBar } from '../components/common/ProgressBar';

export const Shop: React.FC = () => {
  const {
    products,
    groups,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setPage,
    addToCart
  } = useHomekart();

  // Shop states
  const [sortOption, setSortOption] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [showGroupsOnly, setShowGroupsOnly] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Categories list derived from seed products
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Compute number of active groups per product
  const productGroupCounts = useMemo(() => {
    const counts: { [prodId: string]: { members: number; totalGroups: number } } = {};
    groups.forEach(g => {
      if (g.status === 'Open' || g.status === 'Almost Full') {
        if (!counts[g.productId]) {
          counts[g.productId] = { members: 0, totalGroups: 0 };
        }
        counts[g.productId].members += g.currentMembers;
        counts[g.productId].totalGroups += 1;
      }
    });
    return counts;
  }, [groups]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    // Exclude expired product deals
    let result = products.filter(p => !p.expiresAt || new Date() < new Date(p.expiresAt));

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Active group deals filter
    if (showGroupsOnly) {
      result = result.filter(p => productGroupCounts[p.id]?.totalGroups > 0);
    }

    // Sort
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.groupPrice - b.groupPrice);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.groupPrice - a.groupPrice);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, selectedCategory, showGroupsOnly, sortOption, productGroupCounts]);

  const handleProductClick = (productId: string) => {
    setPage('product', { id: productId });
  };

  const handleJoinGroup = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if there is an existing active group for this product
    const existingGroup = groups.find(g => g.productId === product.id && (g.status === 'Open' || g.status === 'Almost Full'));
    
    // Add to cart as a group buy
    addToCart(product, 1, true, existingGroup?.id);
    setPage('cart');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Explore Products
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Unlock premium group discounts. Select your product, invite neighbors, and save together.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search Input for Mobile/Tablet */}
        <div style={{ position: 'relative', width: '100%' }} ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Search our catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 48px 12px 44px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              outline: 'none',
              fontSize: '0.95rem'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#8C9B90',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '4px',
                zIndex: 10
              }}
            >
              ✕
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 250,
              marginTop: '6px',
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setPage('product', { id: s.id });
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-off-white)',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-green-very-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#8C9B90', textTransform: 'uppercase' }}>{s.category}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{s.groupPrice}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Scroller */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }} className="category-scroll">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-green-very-light)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid rgba(24, 83, 56, 0.1)',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort and Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '16px'
        }}>
          {/* Group toggle */}
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-dark)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showGroupsOnly}
              onChange={(e) => setShowGroupsOnly(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--color-primary)'
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} /> Show Active Group Deals Only
            </span>
          </label>

          {/* Sort selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpDown size={16} style={{ color: '#5C6C62' }} />
            <select
              value={sortOption}
              onChange={(e: any) => setSortOption(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map(product => {
            const savings = product.originalPrice - product.groupPrice;
            const activeGroupInfo = productGroupCounts[product.id];
            const activeGroup = groups.find(g => g.productId === product.id && (g.status === 'Open' || g.status === 'Almost Full'));

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="product-card"
              >
                {/* Product Image and Overlay Tags */}
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--color-gray-light)' }}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Category tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: 'var(--color-primary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {product.category}
                  </span>
                  {/* Rating tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(14, 42, 28, 0.85)',
                    color: '#FFFFFF',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={12} fill="var(--color-accent)" stroke="var(--color-accent)" /> {product.rating}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    lineHeight: '1.4',
                    height: '2.8em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: 'var(--color-dark)'
                  }}>
                    {product.name}
                  </h3>

                  {/* Pricing Panel */}
                  <div style={{
                    backgroundColor: 'var(--color-green-very-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(24, 83, 56, 0.05)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#5C6C62', display: 'block' }}>Normal Price</span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', fontSize: '0.85rem', fontWeight: 500 }}>₹{product.originalPrice}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, display: 'block' }}>Group Price</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.2rem' }}>₹{product.groupPrice}</span>
                    </div>
                  </div>

                  {/* Savings details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-green-bright)', fontWeight: 700 }}>
                      SAVE ₹{savings} ({(Math.round((savings / product.originalPrice) * 100))}% OFF)
                    </span>
                  </div>

                  {/* Group Buy Progress Bar */}
                  <div style={{ margin: '4px 0' }}>
                    <ProgressBar 
                      current={activeGroup ? activeGroup.currentMembers : 0} 
                      target={activeGroup ? activeGroup.targetMembers : 5}
                    />
                  </div>

                  {/* Time Remaining & Expected Delivery */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#5C6C62',
                    backgroundColor: 'var(--color-off-white)',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      <Clock size={12} />
                      <span>{getCountdownText(product.expiresAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-green-bright)' }}>
                      <Truck size={12} />
                      <span>Expected Delivery: In 2 days</span>
                    </div>
                  </div>

                  {/* Group Members Progress Status info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: '#5C6C62',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '10px',
                    marginTop: 'auto'
                  }}>
                    <Users size={14} style={{ color: activeGroupInfo ? 'var(--color-primary)' : '#8C9B90' }} />
                    <span>
                      {activeGroupInfo ? (
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {activeGroupInfo.members} members buying locally
                        </strong>
                      ) : (
                        'No local groups yet. Start one!'
                      )}
                    </span>
                  </div>

                  {/* Quick CTAs */}
                  <Button 
                    onClick={(e) => handleJoinGroup(e, product)}
                    fullWidth={true}
                    size="sm"
                  >
                    JOIN GROUP & SAVE
                  </Button>
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
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-dark)', fontWeight: 700 }}>No Products Found</h3>
          <p style={{ color: '#5C6C62', maxWidth: '440px', lineHeight: '1.5', fontSize: '0.95rem' }}>
            {searchQuery ? (
              <span>We couldn't find any products matching "<strong>{searchQuery}</strong>" {selectedCategory !== 'All' ? `in category "${selectedCategory}"` : ''}. Try checking your spelling or search terms.</span>
            ) : selectedCategory !== 'All' ? (
              <span>There are no products in the "<strong>{selectedCategory}</strong>" category right now.</span>
            ) : showGroupsOnly ? (
              <span>No active group deals are currently running. Try toggling off the group deal filter.</span>
            ) : (
              <span>No products match the selected filters.</span>
            )}
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setShowGroupsOnly(false); }}>
            Reset Search & Filters
          </Button>
        </div>
      )}

      {/* CSS helper styles for card lifts */}
      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary) !important;
        }
        .category-scroll::-webkit-scrollbar {
          height: 4px;
        }
      `}</style>
    </div>
  );
};
export default Shop;
