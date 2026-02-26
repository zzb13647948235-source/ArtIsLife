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

  // 4-pointed star — sharp diamond shape matching MANA etoile.svg style
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={`sparkle-twinkle ${className}`}
      style={{ opacity, ...style }}
      aria-hidden="true"
    >
      <path
        d="M14 0 L15.8 12.2 L28 14 L15.8 15.8 L14 28 L12.2 15.8 L0 14 L12.2 12.2 Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Sparkle;
