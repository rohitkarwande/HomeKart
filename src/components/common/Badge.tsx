import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const cleanStatus = status.trim();

  // Status mapping to colors based on design rules:
  // Green = successful/confirmed
  // Orange = pending/action needed
  // Red = cancelled/error
  // Neutral = inactive/completed info
  let bgColor = 'var(--color-gray-light)';
  let textColor = 'var(--color-dark-secondary)';
  let borderColor = 'var(--color-border)';

  const successStates = ['confirmed', 'supplier confirmed', 'ready for pickup', 'completed', 'active', 'successful', 'approved'];
  const pendingStates = ['open', 'joining', 'almost full', 'pending', 'under review', 'processing'];
  const errorStates = ['cancelled', 'refund initiated', 'refunded', 'rejected', 'failed', 'error'];

  const matchStatus = cleanStatus.toLowerCase();

  if (successStates.includes(matchStatus)) {
    bgColor = 'var(--color-green-light)';
    textColor = 'var(--color-primary)';
    borderColor = 'rgba(24, 83, 56, 0.2)';
  } else if (pendingStates.includes(matchStatus)) {
    bgColor = 'var(--color-cream)';
    textColor = '#B25E00'; // Sleek dark orange for contrast
    borderColor = 'rgba(239, 165, 40, 0.3)';
  } else if (errorStates.includes(matchStatus)) {
    bgColor = 'rgba(194, 64, 47, 0.08)';
    textColor = 'var(--color-error)';
    borderColor = 'rgba(194, 64, 47, 0.2)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        width: 'fit-content'
      }}
      className={`hk-badge ${className}`}
    >
      {cleanStatus}
    </span>
  );
};
