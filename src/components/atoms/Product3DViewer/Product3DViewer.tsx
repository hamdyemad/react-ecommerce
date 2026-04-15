import React, { useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { prepare3DUrl } from '../../../utils/3d';

interface Product3DViewerProps {
  url: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ url }) => {
  const normalizedUrl = prepare3DUrl(url);
  const isGLB = url.split('?')[0].toLowerCase().endsWith('.glb');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch for verification if needed, or rely on ErrorBoundary
    if (!normalizedUrl) return;
    
    fetch(normalizedUrl, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) setError(`HTTP ${res.status}`);
      })
      .catch(err => {
        // If it's a CORS error on a direct external link, it might still work in Loader
        // So we don't immediately fail here.
        console.warn("[3DViewer] HEAD check failed:", err);
      });
  }, [normalizedUrl]);

  if (error) {
    return (
      <Html center>
        <div className="bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-black p-2 rounded-xl shadow-lg whitespace-nowrap uppercase tracking-widest border border-white/20">
          Load Error: {error}
        </div>
      </Html>
    );
  }

  if (isGLB) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { scene } = useGLTF(normalizedUrl);
    return <primitive object={scene} />;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const obj = useLoader(OBJLoader, normalizedUrl);
    return <primitive object={obj} />;
  }
};
