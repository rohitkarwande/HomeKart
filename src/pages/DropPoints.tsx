import React, { useState, useMemo } from 'react';
import { useHomekart } from '../store/homekartStore';
import { Button } from '../components/common/Button';
import { Navigation, Search, CheckCircle } from 'lucide-react';

export const DropPoints: React.FC = () => {
  const {
    dropPoints,
    selectedDropPoint,
    setSelectedDropPoint,
    setPage,
    addNotification
  } = useHomekart();

  const [searchArea, setSearchArea] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Filter drop points based on area search
  const filteredPoints = useMemo(() => {
    if (!searchArea) return dropPoints;
    const query = searchArea.toLowerCase();
    return dropPoints.filter(dp => 
      dp.name.toLowerCase().includes(query) ||
      dp.area.toLowerCase().includes(query) ||
      dp.address.toLowerCase().includes(query)
    );
  }, [dropPoints, searchArea]);

  // Simulate finding location
  const handleUseMyLocation = () => {
    setIsLocating(true);
    addNotification('Requesting device location permissions...', 'info');

    setTimeout(() => {
      setIsLocating(false);
      // Select the nearest one
      setSelectedDropPoint(dropPoints[0]);
      addNotification('Located! Nearest point: Hiranandani Gardens (1.2 km away) selected.', 'success');
    }, 1800);
  };

  const handleSelectPoint = (dp: any) => {
    setSelectedDropPoint(dp);
    setPage('home'); // Go back to home after choosing
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Homekart Drop Points
        </h1>
        <p style={{ color: '#5C6C62' }}>
          Select a convenient location nearby. Collect your community-buy products locally with zero shipping charges.
        </p>
      </div>

      {/* Control Panel */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Use My Location Simulated CTA */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            onClick={handleUseMyLocation} 
            disabled={isLocating}
            variant="primary"
            size="lg"
            fullWidth={true}
          >
            <Navigation size={18} style={{ marginRight: '8px' }} />
            {isLocating ? 'Finding your coordinates...' : 'USE CURRENT LOCATION'}
          </Button>
        </div>

        {/* Separator line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#8C9B90',
          fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ padding: '0 16px' }}>OR SEARCH AREA MANUALLY</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Manual search input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Type area, landmark, or city (e.g. Powai, Andheri)..."
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8C9B90' }} />
        </div>
      </div>

      {/* Drop Points Listing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
          Available Drop Points ({filteredPoints.length})
        </h3>

        {filteredPoints.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filteredPoints.map(dp => {
              const isSelected = selectedDropPoint.id === dp.id;

              return (
                <div
                  key={dp.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle size={14} /> ACTIVE PICKUP
                    </span>
                  )}

                  {/* Header info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{
                      backgroundColor: 'var(--color-green-light)',
                      color: 'var(--color-primary)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}>
                      {dp.distance} AWAY
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                      {dp.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#5C6C62', lineHeight: '1.5' }}>
                      {dp.address}
                    </p>
                  </div>

                  {/* Footer actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#8C9B90' }}>
                      Helpline: {dp.phone}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        onClick={() => alert(`Directions to ${dp.name}:\n\n1. Head towards ${dp.area} main commercial hub.\n2. Go to address: ${dp.address}.\n3. Coordinate pickup at drop-off desk.\n4. Call Coordinator at ${dp.phone} for landmark support.`)}
                        variant="secondary"
                        size="sm"
                      >
                        Directions
                      </Button>
                      <Button
                        onClick={() => handleSelectPoint(dp)}
                        disabled={isSelected}
                        variant={isSelected ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {isSelected ? 'SELECTED' : 'SELECT POINT'}
                      </Button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#5C6C62'
          }}>
            No drop points found in "{searchArea}". Try searching another area or city.
          </div>
        )}
      </div>

    </div>
  );
};
export default DropPoints;
