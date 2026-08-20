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
  ...props
}) => {

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        transition: 'all var(--transition-fast)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        opacity: props.disabled ? 0.6 : 1,
        // variant styles
        backgroundColor: variant === 'primary' ? 'var(--color-primary)' : variant === 'secondary' ? 'var(--color-white)' : variant === 'accent' ? 'var(--color-accent)' : 'transparent',
        color: variant === 'primary' ? 'var(--color-white)' : variant === 'secondary' ? 'var(--color-primary)' : variant === 'accent' ? 'var(--color-dark)' : 'var(--color-primary)',
        border: variant === 'primary' ? '1px solid var(--color-primary)' : variant === 'secondary' ? '1px solid var(--color-primary)' : variant === 'accent' ? '1px solid var(--color-accent)' : 'none',
        // size styles
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 28px' : '10px 20px',
        fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
      }}
      className={`hk-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
