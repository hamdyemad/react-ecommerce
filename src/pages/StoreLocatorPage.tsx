import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { tokens } from '../tokens';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';

export function StoreLocatorPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { mode } = useTheme();
  const [animationStep, setAnimationStep] = useState(0); // 0: Galaxy, 1: Planet Down, 2: Zoom, 3: Map

  const storeInfo = settings ? {
    name: settings.address || 'Anibal Store',
    location: settings.address || 'Maadi, Cairo',
    email: settings.email,
    phone: settings.phone_1,
    mapUrl: settings.google_maps_url
  } : {
    name: 'Anibal Store',
    location: 'Maadi, Cairo',
    email: 'info@anibal.com',
    phone: '+201273000046',
    mapUrl: ''
  };



  // Helper to extract coordinates from Google Maps URL
  const getCoordsFromUrl = (url: string) => {
    if (!url) return null;
    // Try to find coordinates in the format @lat,lng or !3dlat!4dlng
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) return `${match[1]},${match[2]}`;
    return null;
  };

  const preciseLocation = getCoordsFromUrl(settings?.google_maps_url || '') || storeInfo.location;

  useEffect(() => {
    // Sequence of animations
    const timers = [
      setTimeout(() => setAnimationStep(1), 500),   // Galaxy -> Planet appears
      setTimeout(() => setAnimationStep(2), 2500),  // Planet Down -> Zoom starts
      setTimeout(() => setAnimationStep(3), 4500),  // Zoom ends -> Map reveals
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">
      {/* Absolute Close Button */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-8 right-8 z-[210] w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 text-white text-2xl hover:bg-white/10 transition-all cursor-pointer"
      >
        ✕
      </button>

      <AnimatePresence>
        {/* Step 0 & 1 & 2: Space Animation */}
        {animationStep < 3 && (
          <motion.div
            key="space"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
          >
            {/* Stars Background */}
            <div className="absolute inset-0 opacity-50">
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white rounded-full"
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: Math.random() * window.innerHeight,
                    opacity: Math.random()
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                  style={{ width: 2, height: 2 }}
                />
              ))}
            </div>

            {/* The Planet */}
            {animationStep >= 1 && (
              <motion.div
                key="planet"
                initial={{ y: -600, scale: 0.2, rotate: 0 }}
                animate={
                  animationStep === 1 
                    ? { y: 0, scale: 1, rotate: 360, filter: 'blur(0px)' } 
                    : { scale: 10, rotate: 720, y: 0, filter: 'blur(10px)', opacity: 0 }
                }
                transition={{ 
                  duration: animationStep === 1 ? 2 : 1.5, 
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                {/* Planet Image Replacement (Gradient Sphere) */}
                <div 
                  className="w-64 h-64 rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5)] border-4 border-white/10"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #3b82f6 0%, #1e3a8a 50%, #000 100%)',
                    boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.8), 0 0 60px rgba(59,130,246,0.4)'
                  }}
                >
                  <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-center bg-no-repeat bg-contain" />
                </div>
                
                {/* Atmosphere */}
                <div className="absolute inset-[-20px] rounded-full border border-blue-400/20 blur-sm animate-pulse" />
              </motion.div>
            )}

            {/* Speed Lines during Zoom */}
            {animationStep === 2 && (
              <div className="absolute inset-0 pointer-events-none z-[60]">
                {Array.from({ length: 60 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 3], x: (Math.random() - 0.5) * 3000, y: (Math.random() - 0.5) * 3000 }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: Math.random() * 0.3 }}
                    className="absolute top-1/2 left-1/2 w-[1px] h-[150px] bg-white/40"
                    style={{
                      rotate: `${Math.random() * 360}deg`,
                      transformOrigin: 'bottom'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Intro Text */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={animationStep === 2 ? { opacity: 0, scale: 2 } : { opacity: 1, y: 0 }}
               className="absolute bottom-20 text-center"
            >
              <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-4">
                {t('storeLocator')}
              </h2>
              <p className="text-blue-400 font-bold tracking-widest opacity-80 animate-pulse">
                {animationStep === 2 ? 'ENTERING ATMOSPHERE...' : 'SYNCING WITH EARTH...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: The Map Reveal */}
      <motion.div 
        className="w-full h-full relative"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ 
          opacity: animationStep === 3 ? 1 : 0, 
          scale: animationStep === 3 ? 1 : 1.2 
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute top-24 left-8 z-10 p-6 rounded-3xl backdrop-blur-xl border shadow-2xl max-w-sm"
             style={{ 
               backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
               borderColor: tokens.colors[mode].border.DEFAULT
             }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl">
              📍
            </div>
            <div>
              <h3 className="font-black text-lg" style={{ color: tokens.colors[mode].text.primary }}>
                {storeInfo.name}
              </h3>
              <p className="text-xs font-bold opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
                {t('common:visitUs')}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm font-bold" style={{ color: tokens.colors[mode].text.secondary }}>
               <span className="text-primary truncate">📞</span> {storeInfo.phone}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold" style={{ color: tokens.colors[mode].text.secondary }}>
               <span className="text-primary truncate">✉️</span> {storeInfo.email}
            </div>
          </div>

          <button 
            onClick={() => window.open(storeInfo.mapUrl || undefined, '_blank')}
            className="w-full py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
          >
             {t('common:viewDetails')}
          </button>
        </div>

        {/* Google Map Iframe */}
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(preciseLocation)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </motion.div>
    </div>
  );
}
