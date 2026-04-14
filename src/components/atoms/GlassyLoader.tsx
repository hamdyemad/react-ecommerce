import { useTheme } from '../../hooks/useTheme';

export function GlassyLoader() {
  const { mode } = useTheme();

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto"
      style={{
        background: mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="relative">
        {/* Modern Spinning Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-2xl" />
        {/* Inner Glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        
        {/* Central Icon or Text */}
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-2xl animate-bounce shadow-xl border border-white/20">
                🛍️
             </div>
        </div>
      </div>
      
      {/* Optional: Add a subtle text underneath */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 mt-8">
        <p className="text-xl font-black tracking-[0.2em] uppercase animate-pulse" style={{ color: mode === 'light' ? '#0f172a' : '#ffffff' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
