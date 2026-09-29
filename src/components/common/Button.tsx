import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'text';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  style: customStyle,
  ...restProps
}) => {

  const getBgColor = () => {
    if (variant === 'primary') return 'var(--color-primary)';
    if (variant === 'secondary') return '#FFFFFF';
    if (variant === 'accent') return 'var(--color-accent)';
    return '#F1F5F9';
  };

  const getColor = () => {
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'secondary') return 'var(--color-primary)';
    if (variant === 'accent') return 'var(--color-dark)';
    return 'var(--color-primary)';
  };

  const getBorder = () => {
    if (variant === 'primary') return '1.5px solid var(--color-primary)';
    if (variant === 'secondary') return '1.5px solid var(--color-primary)';
    if (variant === 'accent') return '1.5px solid var(--color-accent)';
    return '1.5px solid #CBD5E1';
  };

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        borderRadius: '10px',
        transition: 'all 0.15s ease',
        cursor: restProps.disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        opacity: restProps.disabled ? 0.6 : 1,
        backgroundColor: getBgColor(),
        color: getColor(),
        border: getBorder(),
        boxShadow: variant === 'text' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
        padding: size === 'sm' ? '8px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
        fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.05rem' : '0.95rem',
        letterSpacing: '0.01em',
        ...customStyle
      }}
      className={`hk-btn ${className}`}
      {...restProps}
    >
      {children}
    </button>
  );
};
