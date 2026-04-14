import React, { useState, Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture, Float, useGLTF, Center, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { Shirt, User, X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Simple Error Boundary to catch 3D loading errors (CORS, 404s, etc)
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Use Vite Proxy for local storage URLs to bypass CORS totally
const prepareUrl = (url: string) => {
  if (!url) return '';
  if (url.includes(':8000/storage') && (url.toLowerCase().endsWith('.obj') || url.toLowerCase().endsWith('.glb'))) {
    const relative = url.split(':8000')[1];
    console.log(`[TryOn] Normalizing ${url} -> ${relative}`);
    return relative;
  }
  return url;
};

interface TryOnItem {
  id: string | number;
  image: string;
  type: 'top' | 'bottom' | 'full';
}

function ObjModel({ url, type }: { url: string, type: 'top' | 'bottom' }) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const originsToTry = [url];
    console.log(`[TryOn] Attempting load:`, url);
    if (url.includes('127.0.0.1')) originsToTry.push(url.replace('127.0.0.1', 'localhost'));
    else if (url.includes('localhost')) originsToTry.push(url.replace('localhost', '127.0.0.1'));

    const tryFetch = (index: number) => {
      if (index >= originsToTry.length) {
        if (active) setError('Failed to fetch from all origins');
        return;
      }

      fetch(originsToTry[index], { mode: 'cors' })
        .then(res => {
          console.log(`[TryOn] Fetch Status: ${res.status} for ${originsToTry[index]}`);
          if (!res.ok) throw new Error(`HTTP ${res.status} on ${originsToTry[index]}`);
          return res.blob();
        })
        .then(blob => {
          if (active) {
            console.log(`Successfully loaded model from: ${originsToTry[index]}`);
            setLocalUrl(URL.createObjectURL(blob));
          }
        })
        .catch((err) => {
          if (active) {
            console.warn(`[TryOn] Fetch failed for ${originsToTry[index]}:`, err.message);
            if (index + 1 >= originsToTry.length) setError(err.message);
            else tryFetch(index + 1);
          }
        });
    };

    tryFetch(0);
    return () => { 
      active = false; 
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [url]);

  // If the remote model fails, return a high-end placeholder garment
  if (error) return <PlaceholderGarment type={type} error={error} />;
  if (!localUrl) return null;

  return <ObjLoaderInternal url={localUrl} />;
}

function PlaceholderGarment({ type, error }: { type: 'top' | 'bottom', error?: string | null }) {
  return (
    <group position={[0, 0, 0]}>
      {error && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-red-500/90 text-white text-[8px] p-2 rounded-lg whitespace-nowrap backdrop-blur-sm border border-red-400">
            LOAD ERROR: {error}
          </div>
        </Html>
      )}
      {type === 'top' ? (
         <group>
           {/* Stylized Block Shirt */}
           <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.5, 0.6, 0.25]} />
             <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} opacity={0.8} transparent />
           </mesh>
           <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, 0.4]}>
             <boxGeometry args={[0.2, 0.4, 0.15]} />
             <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} opacity={0.8} transparent />
           </mesh>
           <mesh position={[-0.35, 0.1, 0]} rotation={[0, 0, -0.4]}>
             <boxGeometry args={[0.2, 0.4, 0.15]} />
             <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} opacity={0.8} transparent />
           </mesh>
         </group>
      ) : (
         <group>
           {/* Stylized Block Pants */}
           <mesh position={[0.12, -0.2, 0]}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
             <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} opacity={0.8} transparent />
           </mesh>
           <mesh position={[-0.12, -0.2, 0]}>
             <boxGeometry args={[0.2, 0.8, 0.2]} />
             <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} opacity={0.8} transparent />
           </mesh>
         </group>
      )}
    </group>
  );
}

function ObjLoaderInternal({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!child.material || (Array.isArray(child.material) && child.material.length === 0) || (child.material as any).color?.getHex() === 0xffffff) {
           child.material = new THREE.MeshStandardMaterial({ 
             color: '#cbd5e1',
             metalness: 0.2,
             roughness: 0.5,
             side: THREE.DoubleSide
           });
        }
      }
    });
    return clone;
  }, [obj]);

  return <primitive object={clonedObj} />;
}

function GltfModel({ url, type }: { url: string, type: 'top' | 'bottom' }) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const originsToTry = [url];
    console.log(`[TryOn] Attempting GLTF load:`, url);
    if (url.includes('127.0.0.1')) originsToTry.push(url.replace('127.0.0.1', 'localhost'));
    else if (url.includes('localhost')) originsToTry.push(url.replace('localhost', '127.0.0.1'));

    const tryFetch = (index: number) => {
      if (index >= originsToTry.length) {
        if (active) setError('Failed to fetch from all origins');
        return;
      }

      fetch(originsToTry[index], { mode: 'cors' })
        .then(res => {
          console.log(`[TryOn] GLTF Status: ${res.status} for ${originsToTry[index]}`);
          if (!res.ok) throw new Error(`HTTP ${res.status} on ${originsToTry[index]}`);
          return res.blob();
        })
        .then(blob => {
          if (active) {
            console.log(`Successfully loaded GLTF from: ${originsToTry[index]}`);
            setLocalUrl(URL.createObjectURL(blob));
          }
        })
        .catch((err) => {
          if (active) {
            console.warn(`[TryOn] GLTF failed for ${originsToTry[index]}:`, err.message);
            if (index + 1 >= originsToTry.length) setError(err.message);
            else tryFetch(index + 1);
          }
        });
    };

    tryFetch(0);
    return () => { 
      active = false; 
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [url]);

  if (error) return <PlaceholderGarment type={type} error={error} />;
  if (!localUrl) return null;

  return <GltfLoaderInternal url={localUrl} />;
}

function GltfLoaderInternal({ url }: { url: string }) {
  const { scene } = useGLTF(url, undefined, undefined, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  return <primitive object={scene} />;
}

function TexturePlane({ url, type }: { url: string, type: 'top' | 'bottom' }) {
  const texture = useTexture(url);
  return (
    <mesh position={[0, type === 'top' ? 0.5 : -0.8, 0.51]}>
      <planeGeometry args={type === 'top' ? [1.5, 1.5] : [1.2, 1.8]} />
      <meshStandardMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ModelRenderer({ url, type }: { url: string, type: 'top' | 'bottom' }) {
  const isObj = url.toLowerCase().endsWith('.obj');
  const isGltf = url.toLowerCase().endsWith('.gltf') || url.toLowerCase().endsWith('.glb');

  if (isObj) {
    return (
      <Center position={[0, type === 'top' ? 0.5 : -0.8, 0.6]}>
        <ObjModel url={url} type={type} />
      </Center>
    );
  }

  if (isGltf) {
    return (
      <Center position={[0, type === 'top' ? 0.5 : -0.8, 0.6]}>
        <GltfModel url={url} type={type} />
      </Center>
    );
  }

  return <TexturePlane url={url} type={type} />;
}

function Mannequin({ topModel, bottomModel }: { topModel?: string, bottomModel?: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={meshRef}>
      {/* Body Core - Full Humanoid Mannequin */}
      <group position={[0, -1, 0]}>
        {/* Torso/Chest */}
        <mesh position={[0, 1.3, 0]}>
          <capsuleGeometry args={[0.25, 0.6, 8, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[0.35, 1.45, 0]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.07, 0.6, 8, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.35, 1.45, 0]} rotation={[0, 0, 0.2]}>
          <capsuleGeometry args={[0.07, 0.6, 8, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Legs */}
        <mesh position={[0.15, 0.5, 0]}>
          <capsuleGeometry args={[0.1, 1.0, 8, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.15, 0.5, 0]}>
          <capsuleGeometry args={[0.1, 1.0, 8, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Modern Center Garments on the Mannequin */}
      <group position={[0, -1, 0]}>
        {topModel && (
          <Suspense fallback={null}>
            <group position={[0, 1.3, 0.1]}>
               <ModelRenderer url={topModel} type="top" />
            </group>
          </Suspense>
        )}

        {bottomModel && (
          <Suspense fallback={null}>
            <group position={[0, 0.4, 0.1]}>
               <ModelRenderer url={bottomModel} type="bottom" />
            </group>
          </Suspense>
        )}
      </group>
    </group>
  );
}

export function VirtualTryOn() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTop, setActiveTop] = useState<string | null>(null);
  const [activeBottom, setActiveBottom] = useState<string | null>(null);

  // This would be connected to a global state or event bus in a real app
  // For now, let's expose a window function for demo
  (window as any).tryOnProduct = (image: string, type: 'top' | 'bottom') => {
    if (type === 'top') setActiveTop(image);
    else setActiveBottom(image);
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 z-[150] w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
        }}
        whileHover={{ rotate: 10 }}
      >
        <User size={32} />
        {activeTop && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-bounce" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMinimized ? 200 : 400,
              height: isMinimized ? 300 : 600
            }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-32 right-8 z-[160] rounded-[40px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-2xl"
            style={{
              background: 'rgba(15, 23, 42, 0.8)'
            }}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-black text-xs uppercase tracking-widest">Live Fit Lab</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 3D Scene */}
            {!isMinimized && (
              <div className="w-full h-full relative">
                <ErrorBoundary fallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-xl">
                    <div className="text-4xl mb-4">🚫</div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Connection Blocked</h4>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-[250px]">
                      The 3D model could not be fetched. This is usually a CORS issue. 
                      Try running <code className="bg-white/10 px-1 rounded">php artisan optimize:clear</code> on your backend.
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-6 px-6 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg"
                    >
                      Reload Laboratory
                    </button>
                  </div>
                }>
                  <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0.8, 5]} fov={45} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <Environment preset="city" />
                    
                    <Suspense fallback={
                      <Html center>
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-white text-xs font-black uppercase tracking-widest">Loading...</span>
                        </div>
                      </Html>
                    }>
                      <Mannequin 
                        topModel={prepareUrl(activeTop || '')} 
                        bottomModel={prepareUrl(activeBottom || '')} 
                      />
                    </Suspense>

                    <OrbitControls 
                      enableZoom={true} 
                      enablePan={false}
                      minPolarAngle={Math.PI / 4}
                      maxPolarAngle={Math.PI / 1.5}
                      target={[0, 0.8, 0]}
                    />
                  </Canvas>
                </ErrorBoundary>
              </div>
            )}

            {/* Empty State / Controls */}
            {!activeTop && !activeBottom && !isMinimized && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                <Shirt size={48} className="text-blue-400 mb-6 opacity-50" />
                <h3 className="text-white font-black text-xl mb-2">Start Your Fitting</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Go to any product page and click "Try On" to see it on your virtual model.
                </p>
              </div>
            )}

            {/* Reset Button */}
            {(activeTop || activeBottom) && !isMinimized && (
              <button 
                onClick={() => { setActiveTop(null); setActiveBottom(null); }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
              >
                Reset Outfit
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
