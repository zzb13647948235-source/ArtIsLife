
import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorPos = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [magneticTarget, setMagneticTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, .cursor-pointer, [role="button"]');
      setIsHovering(!!interactive);
      
      // Dynamic Magnetic Detection
      if (interactive) {
          setMagneticTarget(interactive as HTMLElement);
      } else {
          setMagneticTarget(null);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let rafId: number;
    const animate = () => {
      let lerpFactor = 0.15;
      let targetX = mousePos.current.x;
      let targetY = mousePos.current.y;

      if (magneticTarget) {
          const rect = magneticTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          // Magnetic Pull (70% towards center, 30% towards mouse)
          targetX = centerX + (mousePos.current.x - centerX) * 0.3;
          targetY = centerY + (mousePos.current.y - centerY) * 0.3;
          lerpFactor = 0.25; // Snappier response for magnetics
      }
      
      cursorPos.current.x += (targetX - cursorPos.current.x) * lerpFactor;
      cursorPos.current.y += (targetY - cursorPos.current.y) * lerpFactor;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, magneticTarget]);

  if (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0))) {
    return null;
  }

  return (
    <div 
      ref={cursorRef}
      className={`
          fixed top-0 left-0 rounded-full pointer-events-none z-[9999]
          transition-all duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isHovering 
              ? 'w-14 h-14 bg-stone-900/10 backdrop-blur-[6px] border border-stone-900/20' 
              : 'w-4 h-4 bg-stone-900/30 backdrop-blur-[2px] border border-stone-900/20'
          }
          ${isClicking ? 'scale-75 brightness-75' : 'scale-100'}
      `}
      style={{ 
          marginLeft: isHovering ? -28 : -8, 
          marginTop: isHovering ? -28 : -8,
          willChange: 'transform, width, height',
          boxShadow: isHovering ? '0 10px 40px rgba(0,0,0,0.08)' : 'none'
      }}
    >
        {isHovering && !isClicking && (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 bg-art-primary rounded-full animate-pulse"></div>
            </div>
        )}
    </div>
  );
};

export default CustomCursor;
