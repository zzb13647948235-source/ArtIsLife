import React, { useRef, useState } from 'react';

const MagneticButton: React.FC<{
  children: React.ReactNode;
  strength?: number;
  className?: string;
}> = ({ children, strength = 0.38, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - (rect.left + rect.width / 2)) * strength,
      y: (e.clientY - (rect.top + rect.height / 2)) * strength,
    });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  const isResting = pos.x === 0 && pos.y === 0;

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isResting
          ? 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'transform 0.12s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default MagneticButton;
