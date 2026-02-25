import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState } from '../types';

interface DavidShowcaseProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

// ── Section opacity helper ────────────────────────────────────────────────────
function sectionOpacity(p: number, start: number, end: number): number {
  const fw = 0.05;
  if (p < start || p > end) return 0;
  if (p < start + fw) return (p - start) / fw;
  if (p > end - fw) return (end - p) / fw;
  return 1;
}

// ── Marble fallback sphere (same GLSL as HeroDavid) ──────────────────────────
const marbleVert = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const marbleFrag = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  float fbm(vec3 p){float v=0.0;float a=0.5;vec3 s=vec3(100.0);for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.0+s;a*=0.5;}return v;}
  void main(){
    vec3 p=vWorldPos*2.2;
    float n=fbm(p+uTime*0.04);
    float marble=sin(p.y*4.0+n*9.0+uTime*0.05)*0.5+0.5;
    float vein=pow(marble,2.5);
    vec3 base=vec3(0.96,0.94,0.90);
    vec3 veinC=vec3(0.72,0.70,0.68);
    vec3 col=mix(base,veinC,vein*0.6);
    vec3 ld=normalize(vec3(1.2,2.0,1.5));
    vec3 vd=normalize(cameraPosition-vWorldPos);
    float diff=max(dot(vNormal,ld),0.0);
    float spec=pow(max(dot(reflect(-ld,vNormal),vd),0.0),32.0);
    float rim=pow(1.0-max(dot(vNormal,vd),0.0),3.0);
    vec3 fc=col*(0.35+diff*0.55)+vec3(1.0,0.97,0.90)*spec*0.4+vec3(0.85,0.75,0.55)*rim*0.18;
    gl_FragColor=vec4(fc,1.0);
  }
`;

const FallbackSphere: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const targetY = scrollProgress < 0.2 ? -2.5 + (scrollProgress / 0.2) * 2.5 : 0;

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    const targetRotY = scrollProgress * Math.PI * 2;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.06;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.06;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.15, 128, 128]} />
      <shaderMaterial ref={matRef} vertexShader={marbleVert} fragmentShader={marbleFrag} uniforms={uniforms} />
    </mesh>
  );
};

// ── GLB David model ───────────────────────────────────────────────────────────
const DavidModel: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/david.glb');

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // GLB has no NORMAL attribute — compute them so lighting works
        if (mesh.geometry && !mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xede9e0,
          roughness: 0.55,
          metalness: 0,
          side: THREE.DoubleSide,
        });
      }
    });
    // Normalize: scale to 2.5 units and center (GLB bbox is ~112 units tall)
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) c.scale.setScalar(2.5 / maxDim);
    const box2 = new THREE.Box3().setFromObject(c);
    const center = box2.getCenter(new THREE.Vector3());
    c.position.sub(center);
    return c;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const targetRotY = scrollProgress * Math.PI * 2;
    // Gentle float when at rest
    const floatOffset = Math.sin(clock.getElapsedTime() * 0.6) * 0.04;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.06;
    groupRef.current.position.y += (floatOffset - groupRef.current.position.y) * 0.04;
  });

  return <primitive ref={groupRef} object={cloned} />;
};

// ── Local error boundary — catches useGLTF load failures ─────────────────────
interface ModelEBProps { scrollProgress: number; children: React.ReactNode; }
interface ModelEBState { failed: boolean; }
class ModelErrorBoundary extends React.Component<ModelEBProps, ModelEBState> {
  constructor(props: ModelEBProps) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError(): ModelEBState { return { failed: true }; }
  render() {
    if (this.state.failed) return <FallbackSphere scrollProgress={this.props.scrollProgress} />;
    return this.props.children;
  }
}

// ── Scene ─────────────────────────────────────────────────────────────────────
const DavidScene: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => (
  <>
    <ambientLight intensity={0.25} color="#f0ece4" />
    <directionalLight position={[2, 4, 2]} intensity={1.8} color="#fff5e0" castShadow />
    <directionalLight position={[-3, 1, -1]} intensity={0.4} color="#c8d8ff" />
    <pointLight position={[1.5, 2, -3]} intensity={0.8} color="#d4a050" />
    <ModelErrorBoundary scrollProgress={scrollProgress}>
      <Suspense fallback={<FallbackSphere scrollProgress={scrollProgress} />}>
        <DavidModel scrollProgress={scrollProgress} />
      </Suspense>
    </ModelErrorBoundary>
  </>
);

// ── Text sections data ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    range: [0.00, 0.22] as [number, number],
    position: 'center' as const,
    tag: 'EST. 1501',
    title: '大卫',
    subtitle: 'David',
    body: null,
    cta: null,
  },
  {
    range: [0.18, 0.42] as [number, number],
    position: 'left' as const,
    tag: '创作背景',
    title: '文艺复兴的巅峰',
    subtitle: null,
    body: '1501年，米开朗基罗受佛罗伦萨共和国委托，历时两年完成这座传世之作。大卫像以圣经英雄大卫迎战歌利亚前的瞬间为题材，展现了人类力量与智慧的完美结合。',
    cta: null,
  },
  {
    range: [0.38, 0.62] as [number, number],
    position: 'right' as const,
    tag: '尺寸与材质',
    title: '517厘米',
    subtitle: null,
    body: '卡拉拉白色大理石雕刻而成，重约6吨。米开朗基罗从一块被前人废弃的大理石中，雕凿出这座震撼人心的巨作。',
    cta: null,
  },
  {
    range: [0.58, 0.82] as [number, number],
    position: 'left' as const,
    tag: '艺术意义',
    title: '人文主义的象征',
    subtitle: null,
    body: '大卫不仅是圣经英雄，更是文艺复兴人文主义精神的化身——理性、勇气与美的完美统一。他凝视远方的眼神，承载着整个时代对人类潜能的无限信仰。',
    cta: null,
  },
  {
    range: [0.78, 1.00] as [number, number],
    position: 'center' as const,
    tag: '探索更多',
    title: '艺术永恒',
    subtitle: '五百年后，大卫依然凝视着我们',
    body: null,
    cta: 'styles' as ViewState,
  },
];

// ── Main component ────────────────────────────────────────────────────────────
const DavidShowcase: React.FC<DavidShowcaseProps> = ({ onNavigate, isActive = true }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const container = outerRef.current?.closest('.scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return;
      const p = container.scrollTop / max;
      setScrollProgress(Math.min(1, Math.max(0, p)));
      if (!hasScrolled && container.scrollTop > 10) setHasScrolled(true);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isActive, hasScrolled]);

  // Reset on re-activation
  useEffect(() => {
    if (isActive) {
      setScrollProgress(0);
      setHasScrolled(false);
    }
  }, [isActive]);

  return (
    // 500vh outer gives 5x scroll distance
    <div ref={outerRef} style={{ height: '500vh' }} className="relative">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0906]">

        {/* Three.js canvas — full background */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0.5, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            style={{ background: '#0a0906' }}
            dpr={[1, 1.5]}
          >
            <DavidScene scrollProgress={scrollProgress} />
          </Canvas>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,9,6,0.7) 100%)' }} />

        {/* ── Section 1: center intro ── */}
        {(() => {
          const op = sectionOpacity(scrollProgress, SECTIONS[0].range[0], SECTIONS[0].range[1]);
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-400/70 mb-6">
                {SECTIONS[0].tag}
              </span>
              <h1 className="font-serif text-[12vw] md:text-[8rem] text-white leading-none tracking-tight drop-shadow-2xl">
                {SECTIONS[0].title}
              </h1>
              <p className="text-stone-400 text-xl md:text-2xl font-light tracking-[0.3em] mt-4 uppercase">
                {SECTIONS[0].subtitle}
              </p>
            </div>
          );
        })()}

        {/* ── Section 2: left ── */}
        {(() => {
          const op = sectionOpacity(scrollProgress, SECTIONS[1].range[0], SECTIONS[1].range[1]);
          return (
            <div className="absolute inset-0 z-20 flex items-center pointer-events-none px-8 md:px-20"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <div className="max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/70 mb-4 block">
                  {SECTIONS[1].tag}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
                  {SECTIONS[1].title}
                </h2>
                <p className="text-stone-400 text-sm md:text-base leading-relaxed font-light">
                  {SECTIONS[1].body}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Section 3: right ── */}
        {(() => {
          const op = sectionOpacity(scrollProgress, SECTIONS[2].range[0], SECTIONS[2].range[1]);
          return (
            <div className="absolute inset-0 z-20 flex items-center justify-end pointer-events-none px-8 md:px-20"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <div className="max-w-sm text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/70 mb-4 block">
                  {SECTIONS[2].tag}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
                  {SECTIONS[2].title}
                </h2>
                <p className="text-stone-400 text-sm md:text-base leading-relaxed font-light">
                  {SECTIONS[2].body}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Section 4: left ── */}
        {(() => {
          const op = sectionOpacity(scrollProgress, SECTIONS[3].range[0], SECTIONS[3].range[1]);
          return (
            <div className="absolute inset-0 z-20 flex items-center pointer-events-none px-8 md:px-20"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <div className="max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/70 mb-4 block">
                  {SECTIONS[3].tag}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
                  {SECTIONS[3].title}
                </h2>
                <p className="text-stone-400 text-sm md:text-base leading-relaxed font-light">
                  {SECTIONS[3].body}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Section 5: center CTA ── */}
        {(() => {
          const op = sectionOpacity(scrollProgress, SECTIONS[4].range[0], SECTIONS[4].range[1]);
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              style={{ opacity: op, transition: 'opacity 0.3s ease', pointerEvents: op > 0.5 ? 'auto' : 'none' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-400/70 mb-6">
                {SECTIONS[4].tag}
              </span>
              <h2 className="font-serif text-5xl md:text-7xl text-white leading-none tracking-tight mb-4">
                {SECTIONS[4].title}
              </h2>
              <p className="text-stone-400 text-base md:text-lg font-light tracking-wide mb-10">
                {SECTIONS[4].subtitle}
              </p>
              <button
                onClick={() => onNavigate('styles')}
                className="px-10 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-stone-900 transition-all duration-500 rounded-full backdrop-blur-sm"
              >
                探索艺术风格
              </button>
            </div>
          );
        })()}

        {/* Scroll progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10 z-30 pointer-events-none">
          <div
            className="h-full bg-amber-400/60 transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Scroll hint arrow */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-700"
          style={{ opacity: hasScrolled ? 0 : 1 }}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">向下滚动</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent animate-bounce" />
        </div>
      </div>
    </div>
  );
};

// Preload the model so it's ready when the page is visited
useGLTF.preload('/david.glb');

export default DavidShowcase;
