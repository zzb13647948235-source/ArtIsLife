
import React, { useEffect, useRef, useState } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only track mouse on non-touch devices
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    const handleMouseMove = (e: MouseEvent) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // On mobile, skip particle system entirely to save GPU
      const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      if (isTouchDevice) return;

      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;
      let animationFrame: number;

      class Particle {
          x: number;
          y: number;
          size: number;
          speedX: number;
          speedY: number;
          alpha: number;
          baseAlpha: number;
          color: string;
          angle: number;
          spin: number;

          constructor() {
              this.x = Math.random() * width;
              this.y = Math.random() * height;
              this.size = Math.random() * 2 + 0.5; 
              this.speedX = Math.random() * 0.2 - 0.1;
              this.speedY = Math.random() * 0.2 - 0.1;
              this.baseAlpha = Math.random() * 0.3 + 0.1;
              this.alpha = this.baseAlpha;
              this.angle = Math.random() * Math.PI * 2;
              this.spin = (Math.random() - 0.5) * 0.02;
              
              // Golden/Earth tones appropriate for art
              const colors = ['#C05621', '#D6A868', '#A0A0A0', '#D4AF37'];
              this.color = colors[Math.floor(Math.random() * colors.length)];
          }

          update() {
              this.x += this.speedX;
              this.y += this.speedY;
              this.angle += this.spin;

              // Subtle mouse interaction (desktop only)
              const mouseX = mousePosRef.current.x;
              const mouseY = mousePosRef.current.y;
              if (mouseX !== 0 || mouseY !== 0) {
                  const dx = mouseX - this.x;
                  const dy = mouseY - this.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  if (dist < 200) {
                      const force = (200 - dist) / 200;
                      this.x -= (dx / dist) * force * 1.5;
                      this.y -= (dy / dist) * force * 1.5;
                      this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
                  } else {
                      this.alpha = this.baseAlpha;
                  }
              } else {
                  this.alpha = this.baseAlpha;
              }

              // Wrap
              if (this.x > width) this.x = 0;
              if (this.x < 0) this.x = width;
              if (this.y > height) this.y = 0;
              if (this.y < 0) this.y = height;
          }

          draw() {
              if (!ctx) return;
              ctx.save();
              ctx.globalAlpha = this.alpha;
              ctx.fillStyle = this.color;
              ctx.translate(this.x, this.y);
              ctx.rotate(this.angle);
              
              // Draw tiny irregular shapes instead of perfect circles for "dust" feel
              ctx.beginPath();
              ctx.moveTo(0, -this.size);
              ctx.lineTo(this.size * 0.8, this.size * 0.8);
              ctx.lineTo(-this.size * 0.8, this.size * 0.8);
              ctx.closePath();
              ctx.fill();
              
              ctx.restore();
          }
      }

      const particles: Particle[] = [];
      const particleCount = Math.min(60, (width * height) / 20000); // Responsive count
      
      for(let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
      }

      const animate = () => {
          ctx.clearRect(0, 0, width, height);

          particles.forEach(p => {
              p.update();
              p.draw();
          });

          animationFrame = requestAnimationFrame(animate);
      }
      animate();

      const handleResize = () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationFrame);
      }
  }, []);

  return (
      <canvas 
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-[5]"
          style={{ mixBlendMode: 'multiply' }} 
      />
  );
};

export default ParticleBackground;
