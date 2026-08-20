import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  showLabels?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  showLabels = true
}) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          fontSize: '0.85rem',
          fontWeight: 600,
          fontFamily: 'var(--font-ui)'
        }}>
          <span style={{ color: 'var(--color-primary)' }}>
            {current} / {target} PEOPLE
          </span>
          <span style={{ color: remaining === 0 ? 'var(--color-primary)' : 'var(--color-dark-secondary)' }}>
            {remaining === 0 ? 'Group Unlocked!' : `${remaining} more needed`}
          </span>
        </div>
      )}
      
      {/* Progress Track */}
      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: 'var(--color-border)',
        borderRadius: '5px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: remaining === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
          borderRadius: '5px',
          transition: 'width var(--transition-normal)'
        }} />
      </div>
      
      {showLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '0.75rem',
          color: '#5C6C62'
        }}>
          <span>{Math.round(percentage)}% filled</span>
          {remaining > 0 && <span>Save on completion</span>}
        </div>
      )}
    </div>
  );
};
