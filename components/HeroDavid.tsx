import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ViewState } from '../types';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import * as THREE from 'three';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

// ── Marble Shader ─────────────────────────────────────────────────────────────
const marbleVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uMorphFactor;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const marbleFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uMouse;

  // Hash function
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  // Value noise
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  // Fractal Brownian Motion
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Marble veining
    vec3 p = vWorldPos * 2.2;
    float n = fbm(p + uTime * 0.04);
    float marble = sin(p.y * 4.0 + n * 9.0 + uTime * 0.05) * 0.5 + 0.5;
    float vein = pow(marble, 2.5);

    // Color palette: warm cream + grey veins + gold highlights
    vec3 baseColor  = vec3(0.96, 0.94, 0.90);   // warm cream
    vec3 veinColor  = vec3(0.72, 0.70, 0.68);   // grey vein
    vec3 goldColor  = vec3(0.85, 0.72, 0.45);   // gold accent

    vec3 col = mix(baseColor, veinColor, vein * 0.6);
    float goldVein = pow(max(0.0, sin(p.x * 6.0 + n * 5.0)), 8.0);
    col = mix(col, goldColor, goldVein * 0.4);

    // Lighting: key light + rim light + ambient
    vec3 lightDir  = normalize(vec3(1.2, 2.0, 1.5));
    vec3 rimDir    = normalize(vec3(-1.0, 0.5, -1.0));
    vec3 viewDir   = normalize(cameraPosition - vWorldPos);

    float diffuse  = max(dot(vNormal, lightDir), 0.0);
    float rim      = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    float spec     = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 32.0);

    vec3 finalColor = col * (0.35 + diffuse * 0.55)
                    + vec3(1.0, 0.97, 0.90) * spec * 0.4
                    + vec3(0.85, 0.75, 0.55) * rim * 0.18;

    // Subtle mouse-driven shimmer
    float shimmer = sin(vUv.x * 20.0 + uMouse * 3.14) * 0.03;
    finalColor += shimmer;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ── Particle Shader ───────────────────────────────────────────────────────────
const particleVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  uniform float uTime;
  uniform float uScroll;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Orbit around Y axis
    float angle = aOffset + uTime * aSpeed * 0.4;
    float radius = length(pos.xz);
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;

    // Vertical drift
    pos.y += sin(uTime * aSpeed + aOffset) * 0.08;

    // Scroll: particles rise and fade
    pos.y += uScroll * 1.5;
    vAlpha = 1.0 - uScroll * 0.8;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const particleFragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float strength = pow(1.0 - d * 2.0, 2.5);
    if (strength < 0.01) discard;
    gl_FragColor = vec4(uColor, strength * vAlpha * 0.85);
  }
`;

// ── Marble Sphere ─────────────────────────────────────────────────────────────
const MarbleSphere: React.FC<{ mouseX: number; mouseY: number; scrollY: number }> = ({ mouseX, mouseY, scrollY }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(() => ({
    uTime:        { value: 0 },
    uMouse:       { value: 0 },
    uMorphFactor: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const t = clock.getElapsedTime();
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uMouse.value += (mouseX - matRef.current.uniforms.uMouse.value) * 0.05;

    // Idle float
    meshRef.current.position.y = Math.sin(t * 0.7) * 0.06;

    // Mouse parallax tilt
    meshRef.current.rotation.x += (mouseY * 0.3 - meshRef.current.rotation.x) * 0.04;
    meshRef.current.rotation.y += (mouseX * 0.5 + t * 0.12 - meshRef.current.rotation.y) * 0.04;

    // Scroll: scale down and move up
    const targetScale = 1 - scrollY * 0.4;
    meshRef.current.scale.setScalar(Math.max(0.3, targetScale));
    meshRef.current.position.z = -scrollY * 1.5;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[1.15, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={marbleVertexShader}
        fragmentShader={marbleFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// ── Gold Dust Particles ───────────────────────────────────────────────────────
const GoldParticles: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, speeds, offsets } = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const speeds    = new Float32Array(count);
    const offsets   = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute on a shell around the sphere
      const theta  = Math.random() * Math.PI * 2;
      const phi    = Math.acos(2 * Math.random() - 1);
      const r      = 1.3 + Math.random() * 0.9;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i]   = 0.8 + Math.random() * 1.6;
      speeds[i]  = 0.3 + Math.random() * 0.7;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, sizes, speeds, offsets };
  }, []);

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uScroll:{ value: 0 },
    uColor: { value: new THREE.Color(0.88, 0.72, 0.38) },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value  = clock.getElapsedTime();
    matRef.current.uniforms.uScroll.value += (scrollY - matRef.current.uniforms.uScroll.value) * 0.06;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ── Soft Ground Shadow ────────────────────────────────────────────────────────
const GroundShadow: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = -1.22 + Math.sin(clock.getElapsedTime() * 0.7) * 0.06;
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.5, 3.5]} />
      <meshBasicMaterial color="#c8b89a" transparent opacity={0.18} />
    </mesh>
  );
};

// ── Scene ─────────────────────────────────────────────────────────────────────
const Scene: React.FC<{ mouseX: number; mouseY: number; scrollY: number }> = ({ mouseX, mouseY, scrollY }) => {
  return (
    <>
      <ambientLight intensity={0.6} color="#fff8f0" />
      <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fffaf0" />
      <directionalLight position={[-2, 1, -2]} intensity={0.3} color="#c8d8ff" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#ffd580" />
      <MarbleSphere mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      <GoldParticles scrollY={scrollY} />
      <GroundShadow />
    </>
  );
};

// ── BrushText (same as original) ──────────────────────────────────────────────
const BrushText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className = '' }) => (
  <span className={`inline-block whitespace-nowrap ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span key={i} className="inline-block opacity-0 animate-apple-reveal"
        style={{ animationDelay: `${delay + i * 0.04}s` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

// ── Marquee ───────────────────────────────────────────────────────────────────
const Marquee: React.FC = () => {
  const items = ["IMPRESSIONISM", "REALISM", "SURREALISM", "RENAISSANCE", "BAROQUE", "CUBISM", "POP ART", "ABSTRACT"];
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden py-6 bg-white/5 backdrop-blur-[1px] border-t border-white/10 z-20 pointer-events-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-stone-400/50 mx-8 flex items-center gap-4">
            {item} <div className="w-1 h-1 bg-art-primary rounded-full opacity-50" />
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Main Hero ─────────────────────────────────────────────────────────────────
const HeroDavid: React.FC<HeroProps> = ({ onNavigate, isActive = true }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isAnimateStart, setIsAnimateStart] = useState(false);
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setIsAnimateStart(false);
      const timer = setTimeout(() => setIsAnimateStart(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || !isActive) return;
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }));
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Track scroll within the hero container
  useEffect(() => {
    const container = containerRef.current?.closest('.scroll-container');
    if (!container) return;
    const handleScroll = () => {
      const progress = Math.min(container.scrollTop / (window.innerHeight * 0.6), 1);
      setScrollY(progress);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isActive]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-transparent text-stone-900 flex items-center overflow-hidden">

      {/* Background watermark */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] text-[20vw] font-serif text-art-primary opacity-[0.02] leading-none select-none mix-blend-multiply whitespace-nowrap"
          style={{ transform: `rotate(-5deg) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`, transition: 'transform 0.2s ease-out' }}>
          MASTERPIECE
        </div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 h-full">

        {/* Left: Text */}
        <div className="lg:col-span-6 flex flex-col justify-center relative z-20 pt-24 lg:pt-0">
          <div className="flex items-center gap-6 mb-8 animate-fade-in group cursor-default">
            <div className="w-16 h-[1px] bg-art-primary origin-left transition-all duration-700 group-hover:w-24 group-hover:h-[2px]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary/80 group-hover:text-art-primary transition-colors">{t('hero.est')}</span>
          </div>

          <h1 className="font-serif text-art-accent tracking-tighter select-none flex flex-col gap-1 md:gap-3 drop-shadow-sm relative z-30 mb-10 w-full">
            <span className="text-[12vw] lg:text-[7rem] leading-[0.9] block mix-blend-multiply transition-transform hover:scale-[1.02] origin-left duration-500">
              <BrushText text={t('hero.title_1')} delay={0.2} />
            </span>
            <span className="text-[8vw] lg:text-[5rem] leading-[1] block italic font-light text-stone-400 pl-2 lg:pl-16">
              <BrushText text={t('hero.title_2')} delay={0.6} />
            </span>
            <span className="text-[12vw] lg:text-[7.5rem] leading-[0.9] block text-art-primary pb-2">
              <BrushText text={t('hero.title_3')} delay={1.0} />
            </span>
          </h1>

          <div className="relative pl-8 border-l-2 border-art-primary/20 max-w-lg animate-fade-in-up delay-[1400ms]">
            <p className="text-lg md:text-xl text-stone-500 font-light leading-relaxed">{t('hero.subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-6 mt-10 animate-fade-in-up delay-[1600ms]">
            <button onClick={() => onNavigate('game')}
              className="group relative px-10 py-5 bg-art-accent text-white rounded-full overflow-hidden shadow-hard hover:-translate-y-1 transition-all duration-500 active:scale-95">
              <div className="absolute inset-0 w-full h-full bg-art-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]" />
              <div className="relative z-10 flex items-center gap-3">
                <PlayCircle size={18} className="group-hover:fill-white/20 transition-all" />
                <span className="font-bold uppercase tracking-[0.25em] text-xs">{t('hero.btn_start')}</span>
              </div>
            </button>
            <button onClick={() => onNavigate('gallery')}
              className="group flex items-center gap-3 px-8 py-5 rounded-full border border-stone-200 hover:border-art-accent bg-white/40 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-800 group-hover:text-art-accent">{t('hero.btn_create')}</span>
              <ArrowRight size={16} className="text-art-primary group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right: Three.js Canvas */}
        <div className="hidden lg:block lg:col-span-6 relative h-full">
          <div
            className={`w-full h-full transition-all duration-[2s] ${isAnimateStart ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'drop-shadow(0 30px 60px rgba(188,75,26,0.12))' }}
          >
            <Canvas
              camera={{ position: [0, 0, 3.8], fov: 38 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              style={{ background: 'transparent' }}
              dpr={[1, 1.5]}
            >
              <Scene mouseX={mousePos.x} mouseY={mousePos.y} scrollY={scrollY} />
            </Canvas>
          </div>

          {/* Decorative label */}
          <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-[2000ms] ${isAnimateStart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-art-primary/40" />
            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-stone-400/60">Digital Renaissance</span>
          </div>
        </div>
      </div>

      <Marquee />
    </div>
  );
};

export default HeroDavid;
