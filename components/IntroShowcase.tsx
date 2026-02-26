import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState } from '../types';

interface IntroShowcaseProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

function sectionOpacity(p: number, start: number, end: number): number {
  const fw = 0.05;
  if (p < start || p > end) return 0;
  if (p < start + fw) return (p - start) / fw;
  if (p > end - fw) return (end - p) / fw;
  return 1;
}

// ── Camera keyframes ──────────────────────────────────────────────────────────
const CAM_KEYS = [
  { scroll: 0.0, pos: new THREE.Vector3(0, 0,   5.5), look: new THREE.Vector3(0, 0, 0) },
  { scroll: 0.3, pos: new THREE.Vector3(0, 0.3, 3.2), look: new THREE.Vector3(0, 0.3, 0) },
  { scroll: 1.0, pos: new THREE.Vector3(0, 0.5, 4.8), look: new THREE.Vector3(0, 0.2, 0) },
];

function lerpCamKey(scroll: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i], b = CAM_KEYS[i + 1];
    if (scroll >= a.scroll && scroll <= b.scroll) {
      const t = (scroll - a.scroll) / (b.scroll - a.scroll);
      return { pos: a.pos.clone().lerp(b.pos, t), look: a.look.clone().lerp(b.look, t) };
    }
  }
  const last = CAM_KEYS[CAM_KEYS.length - 1];
  return { pos: last.pos.clone(), look: last.look.clone() };
}

// ── Camera rig — reads ref directly, no React re-render needed ────────────────
const CameraRig: React.FC<{ spRef: React.MutableRefObject<number> }> = ({ spRef }) => {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 0, 6));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const sp = spRef.current;
    const { pos, look } = lerpCamKey(sp);
    camPos.current.lerp(pos, 0.06);
    lookTarget.current.lerp(look, 0.06);
    camera.position.copy(camPos.current);
    camera.lookAt(lookTarget.current);
  });

  return null;
};

// ── Marble fallback ───────────────────────────────────────────────────────────
const marbleVert = `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  void main() {
    vUv = uv; vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0); vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const marbleFrag = `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  uniform float uTime;
  float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  float fbm(vec3 p){float v=0.0;float a=0.5;vec3 s=vec3(100.0);for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.0+s;a*=0.5;}return v;}
  void main(){
    vec3 p=vWorldPos*2.2; float n=fbm(p+uTime*0.04);
    float marble=sin(p.y*4.0+n*9.0+uTime*0.05)*0.5+0.5; float vein=pow(marble,2.5);
    vec3 base=vec3(0.96,0.94,0.90); vec3 veinC=vec3(0.72,0.70,0.68);
    vec3 col=mix(base,veinC,vein*0.6);
    vec3 ld=normalize(vec3(1.2,2.0,1.5)); vec3 vd=normalize(cameraPosition-vWorldPos);
    float diff=max(dot(vNormal,ld),0.0); float spec=pow(max(dot(reflect(-ld,vNormal),vd),0.0),32.0);
    float rim=pow(1.0-max(dot(vNormal,vd),0.0),3.0);
    vec3 fc=col*(0.35+diff*0.55)+vec3(1.0,0.97,0.90)*spec*0.4+vec3(0.85,0.75,0.55)*rim*0.18;
    gl_FragColor=vec4(fc,1.0);
  }
`;

const FallbackSphere: React.FC<{ spRef: React.MutableRefObject<number> }> = ({ spRef }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const sp = spRef.current;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    const targetY = sp < 0.25 ? -1.5 + (sp / 0.25) * 1.5 : 0;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.06;
  });

  return (
    <mesh ref={meshRef} position={[0, -1.5, 0]}>
      <sphereGeometry args={[1.15, 128, 128]} />
      <shaderMaterial ref={matRef} vertexShader={marbleVert} fragmentShader={marbleFrag} uniforms={uniforms} />
    </mesh>
  );
};

// ── GLB model ─────────────────────────────────────────────────────────────────
const IntroModel: React.FC<{
  spRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ spRef, mouseRef }) => {
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
          color: 0xf0ece4, roughness: 0.45, metalness: 0.05,
          side: THREE.DoubleSide,
        });
      }
    });
    // GLB bbox Y: 25→137 (~112 units) — normalize to 3.2 units and center
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) c.scale.setScalar(3.2 / maxDim);
    const box2 = new THREE.Box3().setFromObject(c);
    const center = box2.getCenter(new THREE.Vector3());
    c.position.sub(center);
    return c;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const sp = spRef.current;
    const { x: mx, y: my } = mouseRef.current;

    // Rise from y=-1.5 to y=0 during first 25% of scroll
    const riseTarget = sp < 0.25 ? -1.5 + (sp / 0.25) * 1.5 : 0;
    const floatOffset = sp >= 0.25 ? Math.sin(clock.getElapsedTime() * 0.6) * 0.04 : 0;
    groupRef.current.position.y += (riseTarget + floatOffset - groupRef.current.position.y) * 0.05;

    // Stop rotation when "共创未来" section appears (sp >= 0.70)
    if (sp >= 0.70) return;

    // Scroll-driven Y rotation (0 → ~200°) + subtle mouse parallax
    const targetRotY = sp * Math.PI * 1.1 + mx * 0.18;
    const targetRotX = my * 0.07;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <primitive object={cloned} />
    </group>
  );
};

interface ModelEBProps { spRef: React.MutableRefObject<number>; mouseRef: React.MutableRefObject<{ x: number; y: number }>; children: React.ReactNode; }
interface ModelEBState { failed: boolean; }
class ModelErrorBoundary extends React.Component<ModelEBProps, ModelEBState> {
  constructor(props: ModelEBProps) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError(): ModelEBState { return { failed: true }; }
  render() {
    if (this.state.failed) return <FallbackSphere spRef={this.props.spRef} />;
    return this.props.children;
  }
}

// ── Scene ─────────────────────────────────────────────────────────────────────
const IntroScene: React.FC<{
  spRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ spRef, mouseRef }) => (
  <>
    <CameraRig spRef={spRef} />
    {/* Rembrandt lighting rig */}
    <ambientLight intensity={0.15} color="#1a1510" />
    {/* Key: upper-left warm, ~45° — creates the signature triangle */}
    <directionalLight position={[-2.5, 4, 1.5]} intensity={4.5} color="#ffe8c0" />
    {/* Fill: right cool, very dim — 1:7 ratio keeps shadow dramatic */}
    <directionalLight position={[3, 0.5, 1]} intensity={0.5} color="#a0b8e0" />
    {/* Rim: behind-right warm — separates bust from black bg */}
    <pointLight position={[1.5, 3, -3]} intensity={3.5} color="#ffc060" />
    {/* Rainbow color bounce from below */}
    <pointLight position={[0, -2, 1]} intensity={0.8} color="#ff6090" />
    <ModelErrorBoundary spRef={spRef} mouseRef={mouseRef}>
      <Suspense fallback={<FallbackSphere spRef={spRef} />}>
        <IntroModel spRef={spRef} mouseRef={mouseRef} />
      </Suspense>
    </ModelErrorBoundary>
  </>
);

// ── Rainbow horizontal stripes (scroll-driven, left→right) ───────────────────
const H_COLORS = [
  '#F97028', '#F489A3', '#F0BB0D', '#F3A20F', '#E40303',
  '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787',
  '#784F17', '#000000', '#FFAFC8', '#74D7EE', '#20B2AA',
  '#F97028', '#F489A3', '#F0BB0D',
];

const RainbowHLines: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const rawProgress = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.55));

  const W = 1200;
  const H = 800;
  const count = H_COLORS.length;
  const stripeH = H / count; // evenly divide full height

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      {H_COLORS.map((color, i) => {
        const y = (i + 0.5) * stripeH;
        // stagger: top lines first, bottom lines last
        const stagger = (i / (count - 1)) * 0.5;
        const lineProgress = Math.max(0, Math.min(1, (rawProgress - stagger) / 0.5));
        const dashOffset = W * (1 - lineProgress);
        return (
          <line
            key={i}
            x1={0} y1={y} x2={W} y2={y}
            stroke={color}
            strokeWidth={stripeH}
            strokeLinecap="butt"
            strokeDasharray={W}
            strokeDashoffset={dashOffset}
            opacity={1}
          />
        );
      })}
    </svg>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const IntroShowcase: React.FC<IntroShowcaseProps> = ({ onNavigate, isActive = true }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const spRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const container = outerRef.current?.closest('.scroll-container') as HTMLElement | null;
    if (!container) return;
    const handleScroll = () => {
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return;
      const p = Math.min(1, Math.max(0, container.scrollTop / max));
      spRef.current = p;           // sync update — useFrame reads this every frame
      setScrollProgress(p);        // async update — drives text opacity + progress bar
      if (!hasScrolled && container.scrollTop > 10) setHasScrolled(true);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isActive, hasScrolled]);

  useEffect(() => {
    if (isActive) { spRef.current = 0; setScrollProgress(0); setHasScrolled(false); }
  }, [isActive]);

  return (
    <div ref={outerRef} style={{ height: '500vh' }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Rainbow horizontal lines — behind everything */}
        <div className="absolute inset-0 z-0">
          <RainbowHLines scrollProgress={scrollProgress} />
        </div>

        {/* Canvas — transparent bg so rainbow shows through */}
        <div className="absolute inset-0 z-10">
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ background: 'transparent' }}
            dpr={[1, 1.5]}
          >
            <IntroScene spRef={spRef} mouseRef={mouseRef} />
          </Canvas>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.82) 100%)' }} />

        {/* Section 1 — center intro */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.00, 0.25);
          // Apple-style: text slides up + fades in as section enters
          const entered = scrollProgress > 0.01;
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
              style={{ opacity: op, transition: 'opacity 0.5s ease' }}>
              <p style={{
                transform: entered ? 'translateY(0)' : 'translateY(16px)',
                opacity: entered ? 1 : 0,
                transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 0.9s ease 0.1s',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '2rem'
              }}>A New Era of Art</p>
              <h1 style={{
                fontSize: 'clamp(4rem, 13vw, 11rem)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 700,
                transform: entered ? 'translateY(0)' : 'translateY(32px)',
                opacity: entered ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s, opacity 1.1s ease 0.2s',
                color: 'white', textAlign: 'center',
              }}>
                ArtIsLife
              </h1>
              <p style={{
                transform: entered ? 'translateY(0)' : 'translateY(20px)',
                opacity: entered ? 0.5 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.4s, opacity 1.1s ease 0.4s',
                fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 300, letterSpacing: '0.15em', marginTop: '1.5rem', color: 'white'
              }}>
                艺术，让生命更丰盛
              </p>
            </div>
          );
        })()}

        {/* Section 2 — left */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.22, 0.50);
          const entered = scrollProgress > 0.24;
          return (
            <div className="absolute inset-0 z-20 flex items-center pointer-events-none px-6 md:px-24"
              style={{ opacity: op, transition: 'opacity 0.5s ease' }}>
              <div className="max-w-lg">
                <p style={{
                  transform: entered ? 'translateY(0)' : 'translateY(14px)',
                  opacity: entered ? 1 : 0,
                  transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0s, opacity 0.9s ease 0s',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '1.5rem', display: 'block'
                }}>创作者的家园</p>
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700,
                  transform: entered ? 'translateY(0)' : 'translateY(28px)',
                  opacity: entered ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 1.1s ease 0.1s',
                  color: 'white', marginBottom: '2rem'
                }}>
                  为艺术而生。
                </h2>
                <p style={{
                  transform: entered ? 'translateY(0)' : 'translateY(18px)',
                  opacity: entered ? 0.45 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.25s, opacity 1.1s ease 0.25s',
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', fontWeight: 300, lineHeight: 1.7, maxWidth: '28rem', color: 'white'
                }}>
                  AI 赋能创作，区块链确权资产，社区连接灵魂。一体化平台，为每一位创作者而建。
                </p>
              </div>
            </div>
          );
        })()}

        {/* Section 3 — right */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.45, 0.75);
          const entered = scrollProgress > 0.47;
          return (
            <div className="absolute inset-0 z-20 flex items-center justify-end pointer-events-none px-6 md:px-24"
              style={{ opacity: op, transition: 'opacity 0.5s ease' }}>
              <div className="max-w-lg" style={{ textAlign: 'right' }}>
                <p style={{
                  transform: entered ? 'translateY(0)' : 'translateY(14px)',
                  opacity: entered ? 1 : 0,
                  transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0s, opacity 0.9s ease 0s',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '1.5rem', display: 'block'
                }}>市场前景</p>
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700,
                  transform: entered ? 'translateY(0)' : 'translateY(28px)',
                  opacity: entered ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 1.1s ease 0.1s',
                  color: 'white', marginBottom: '2rem'
                }}>
                  千亿赛道，<br />正在开启。
                </h2>
                <p style={{
                  transform: entered ? 'translateY(0)' : 'translateY(18px)',
                  opacity: entered ? 0.45 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.25s, opacity 1.1s ease 0.25s',
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', fontWeight: 300, lineHeight: 1.7, maxWidth: '28rem', marginLeft: 'auto', color: 'white'
                }}>
                  全球数字艺术市场预计 2028 年突破 $1,200 亿，年复合增长率 34%。我们正处于变革核心。
                </p>
              </div>
            </div>
          );
        })()}

        {/* Section 4 — center CTA — stays fixed once visible */}
        {(() => {
          const op = scrollProgress >= 0.70 ? Math.min(1, (scrollProgress - 0.70) / 0.08) : 0;
          const entered = scrollProgress > 0.72;
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              style={{ opacity: op, transition: 'opacity 0.5s ease', pointerEvents: op > 0.5 ? 'auto' : 'none' }}>
              <p style={{
                transform: entered ? 'translateY(0)' : 'translateY(14px)',
                opacity: entered ? 1 : 0,
                transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0s, opacity 0.9s ease 0s',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.6em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '2rem'
              }}>共创未来</p>
              <h2 style={{
                fontSize: 'clamp(3rem, 9vw, 8rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 700,
                transform: entered ? 'translateY(0)' : 'translateY(36px)',
                opacity: entered ? 1 : 0,
                transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 1.2s ease 0.1s',
                color: 'white', textAlign: 'center', marginBottom: '4rem'
              }}>
                现在，<br />就是起点。
              </h2>
              <button
                onClick={() => onNavigate('home')}
                style={{
                  transform: entered ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                  opacity: entered ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s, opacity 1.1s ease 0.3s',
                }}
                className="group px-8 md:px-12 py-4 md:py-5 bg-white text-stone-900 text-xs font-bold uppercase tracking-[0.35em] hover:bg-amber-400 transition-colors duration-500 rounded-full active:scale-95"
              >
                进入平台
              </button>
            </div>
          );
        })()}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10 z-30 pointer-events-none">
          <div className="h-full bg-amber-400/60 transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />
        </div>

        {/* Scroll hint */}
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

export default IntroShowcase;
