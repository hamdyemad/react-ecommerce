import { useState, useEffect } from 'react';
import { useDirection } from '../../../hooks/useDirection';
import { useTheme } from '../../../hooks/useTheme';
import { tokens } from '../../../tokens';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { direction } = useDirection();
  const { mode } = useTheme();

  // Show button when page is scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${direction === 'rtl' ? 'left-6' : 'right-6'} bottom-6 z-50 p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
      style={{ 
        backgroundColor: tokens.colors[mode].primary.DEFAULT,
        color: '#ffffff'
      }}
      aria-label="Scroll to top"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
