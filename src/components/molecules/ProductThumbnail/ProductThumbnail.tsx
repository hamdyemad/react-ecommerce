import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Product3DViewer } from '../../atoms/Product3DViewer/Product3DViewer';
import { ErrorBoundary } from '../../atoms/ErrorBoundary/ErrorBoundary';
import { is3DFile } from '@/utils/3d';
import { cn } from '@/utils/cn';

interface ProductThumbnailProps {
  image: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  is3D?: boolean;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  image,
  name,
  className,
  size = 'md',
  is3D: force3D
}) => {
  const is3D = force3D || is3DFile(image);

  const containerClasses = cn(
    "relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex-shrink-0 flex items-center justify-center",
    size === 'sm' && "w-12 h-12 sm:w-16 sm:h-16",
    size === 'md' && "w-20 h-20 sm:w-24 sm:h-24",
    size === 'lg' && "w-32 h-32 sm:w-40 sm:h-40",
    className
  );

  if (is3D) {
    return (
      <div className={containerClasses}>
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
          <ErrorBoundary fallback={
            <div className="flex items-center justify-center h-full opacity-40">
              <span className="text-[10px] font-black uppercase">3D Error</span>
            </div>
          }>
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 40 }} gl={{ alpha: true }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.4} adjustCamera={true}>
                  <Product3DViewer url={image} />
                </Stage>
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        src={image || 'https://placehold.co/200?text=No+Image'}
        alt={name}
        className="w-full h-full object-contain p-1"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/200?text=No+Image';
        }}
      />
    </div>
  );
};
