import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  lightText = false
}) => {
  const dimensions = {
    sm: { box: 32, icon: 20 },
    md: { box: 40, icon: 26 },
    lg: { box: 64, icon: 42 }
  };

  const selectedDim = dimensions[size];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size === 'lg' ? '16px' : '10px',
      cursor: 'pointer',
      userSelect: 'none'
    }}>
      {/* Deep Green Background Box */}
      <div style={{
        width: `${selectedDim.box}px`,
        height: `${selectedDim.box}px`,
        backgroundColor: '#185338',
        borderRadius: size === 'lg' ? '12px' : '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* White House Shape with Orange Door */}
        <svg
          width={selectedDim.icon}
          height={selectedDim.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House Base & Roof (White) */}
          <path
            d="M12 2.5L3 10.5V20.5C3 21.0523 3.44772 21.5 4 21.5H20C20.5523 21.5 21 21.0523 21 20.5V10.5L12 2.5Z"
            fill="#FFFFFF"
          />
          {/* Orange/Gold Doorway */}
          <path
            d="M9.5 21.5V13.5C9.5 12.9477 9.94772 12.5 10.5 12.5H13.5C14.0523 12.5 14.5 12.9477 14.5 13.5V21.5H9.5Z"
            fill="#EFA528"
          />
        </svg>
      </div>

      {showText && (
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: size === 'lg' ? '2rem' : size === 'md' ? '1.4rem' : '1.1rem',
          color: lightText ? '#FFFFFF' : '#185338',
          letterSpacing: '0.03em',
        }}>
          HOMEKART
        </span>
      )}
    </div>
  );
};
export default Logo;
