import React from 'react';

interface SparkleProps {
  size?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'star4' | 'circle';
}

const Sparkle: React.FC<SparkleProps> = ({
  size = 24,
  opacity = 0.8,
  className = '',
  style = {},
  variant = 'star4',
}) => {
  if (variant === 'circle') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={`sparkle-twinkle ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  // 4-pointed star
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`sparkle-twinkle ${className}`}
      style={{ opacity, ...style }}
      aria-hidden="true"
    >
      <path
        d="M12 2 C12 2, 13 8, 12 12 C11 8, 12 2, 12 2Z
           M12 22 C12 22, 11 16, 12 12 C13 16, 12 22, 12 22Z
           M2 12 C2 12, 8 11, 12 12 C8 13, 2 12, 2 12Z
           M22 12 C22 12, 16 13, 12 12 C16 11, 22 12, 22 12Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Sparkle;
