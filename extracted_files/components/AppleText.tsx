
import React from 'react';

interface AppleTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const AppleText: React.FC<AppleTextProps> = ({ text, className = "", delay = 0 }) => (
  <span className={`inline-block ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span
        key={i}
        className="inline-block opacity-0 animate-apple-reveal"
        style={{ animationDelay: `${delay + i * 0.04}s`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

export default AppleText;
