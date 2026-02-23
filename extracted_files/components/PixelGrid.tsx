import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// -- Helpers to generate the image data for the grid colors --
const createDataTexture = (size: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new Uint8ClampedArray(size * size * 4);

  // Fill background (Dark Blue/Black)
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, size, size);
  
  // Draw Logo Shape
  ctx.font = `900 ${size * 0.8}px "Playfair Display", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Create Vivid Gradient for the "A"
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0.2, '#FF6B00'); // Neon Orange
  gradient.addColorStop(0.5, '#FFD700'); // Gold
  gradient.addColorStop(0.8, '#9D00FF'); // Neon Purple
  
  ctx.fillStyle = gradient;
  
  // Add some glow effect in texture
  ctx.shadowColor = "#FF6B00";
  ctx.shadowBlur = 10;
  
  ctx.fillText('A', size / 2, size / 2 + size * 0.05);
  
  // Get pixel data
  return ctx.getImageData(0, 0, size, size).data;
};

const GridInstance: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Grid Config - Tuned for density and visibility
  const gridSize = 50; 
  const count = gridSize * gridSize;
  const spacing = 0.5; // Tighter spacing
  
  const imageData = useMemo(() => createDataTexture(gridSize), []);
  
  // Store initial positions
  const initials = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const offset = (gridSize * spacing) / 2 - (spacing / 2);
    let i = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Flip Y to match canvas coords
        arr[i * 3 + 0] = x * spacing - offset;
        arr[i * 3 + 1] = -(y * spacing - offset);
        arr[i * 3 + 2] = 0;
        i++;
      }
    }
    return arr;
  }, []);

  // Initialize Colors & Positions
  useEffect(() => {
    if (meshRef.current && imageData) {
      let i = 0;
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          dummy.position.set(initials[i * 3], initials[i * 3 + 1], 0);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          
          const pixelIndex = (y * gridSize + x) * 4;
          const r = imageData[pixelIndex];
          const g = imageData[pixelIndex + 1];
          const b = imageData[pixelIndex + 2];
          const a = imageData[pixelIndex + 3]; // Alpha usually 255 if drawn
          
          const color = new THREE.Color();
          
          // Heuristic: if pixel is bright, it's the logo. Else background.
          // Using luminance check or specific color check
          const brightness = (r + g + b) / 3;
          
          if (brightness > 40) {
             // Logo pixels
             color.setRGB(r/255, g/255, b/255);
             color.multiplyScalar(1.5); // Boost saturation/brightness
          } else {
             // Background: Subtle Blue/Purple Gradient
             // Variation based on position for texture
             const hue = 0.6 + (x/gridSize) * 0.1; // Blue to Purple
             color.setHSL(hue, 0.6, 0.05 + Math.random() * 0.05); 
          }
          
          meshRef.current.setColorAt(i, color);
          i++;
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [dummy, imageData, initials]);

  // Physics Loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Mouse coords: -1 to 1. Convert to world approximate
    // Viewport width at z=0 is roughly accessible via viewport.width
    // But camera is at z=18, so we need to account for perspective if we want precision.
    // For simple effect, approximate scaling works.
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;

    let i = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const ox = initials[i * 3 + 0];
        const oy = initials[i * 3 + 1];
        
        // Distance from mouse
        const dx = mouseX - ox;
        const dy = mouseY - oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // INTERACTION LOGIC
        // Radius of effect
        const radius = 8.0; 
        let influence = Math.max(0, 1 - dist / radius);
        // Ease out (smooth falloff)
        influence = Math.pow(influence, 2);

        // 1. Z-displacement (The Wave)
        // Background breathing wave
        const ambientWave = Math.sin(ox * 0.3 + time * 0.8) * Math.cos(oy * 0.3 + time * 0.6) * 0.5;
        // Mouse push wave (stronger)
        const mouseWave = influence * 5.0 * Math.cos(dist * 1.5 - time * 3);
        const z = ambientWave + mouseWave;

        // 2. Rotation (Twist away from mouse)
        const rotX = influence * (mouseY - oy) * 0.8 + (time * 0.2); // Add constant spin
        const rotY = influence * -(mouseX - ox) * 0.8 + (time * 0.1);
        
        // 3. Scale (Pulse)
        // Logo parts pulse more?
        const scaleBase = 1.0;
        const scale = scaleBase + (influence * 0.5);

        dummy.position.set(ox, oy, z);
        dummy.rotation.set(rotX, rotY, 0);
        dummy.scale.setScalar(scale);
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.4, 0.4, 0.4]} /> 
      <meshStandardMaterial 
        roughness={0.4} 
        metalness={0.8} 
        color="#ffffff"
      />
    </instancedMesh>
  );
};

const PixelGrid: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-[#0a0a0a] overflow-hidden rounded-2xl border border-stone-800 shadow-2xl">
        {/* Simple gradient bg behind canvas */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0b2e] to-[#0f172a] pointer-events-none"></div>

        <Canvas camera={{ position: [0, 0, 20], fov: 40 }} dpr={[1, 2]}> 
            {/* Bright Lights for Visibility */}
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 20]} intensity={2.5} color="#ffaa00" />
            <pointLight position={[-10, -10, 10]} intensity={2.5} color="#00aaff" />
            
            <GridInstance />
        </Canvas>
        
        {/* Overlay Text */}
        <div className="absolute bottom-5 left-6 pointer-events-none z-10">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">System Active</span>
            </div>
            <p className="text-white/80 font-serif italic text-lg">Neural Interface</p>
        </div>
    </div>
  );
};

export default PixelGrid;