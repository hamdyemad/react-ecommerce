import { useState, useEffect, useRef } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { useDirection } from '../../../hooks/useDirection';
import { useTheme } from '../../../hooks/useTheme';
import { tokens } from '../../../tokens';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  peekAmount?: number; // Percentage of next/prev slide to show
  onSlideChange?: (index: number) => void;
  onEndReached?: () => void;
  initialIndex?: number;
  activeSlide?: number;
  variant?: 'overlay' | 'standalone'; // overlay = white on dark bg, standalone = theme-aware
}

export function Carousel({ 
  children, 
  autoPlay = true, 
  interval = 5000,
  showDots = true,
  showArrows = true,
  peekAmount = 0, // Default no peek
  onSlideChange,
  onEndReached,
  initialIndex = 0,
  activeSlide,
  variant = 'overlay'
}: CarouselProps) {
  const { direction } = useDirection();
  const { mode } = useTheme();
  const isStandalone = variant === 'standalone';
  const [currentIndex, setCurrentIndex] = useState(activeSlide ?? initialIndex);

  useEffect(() => {
    if (activeSlide !== undefined && activeSlide !== currentIndex) {
      goToSlide(activeSlide);
    }
  }, [activeSlide]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [animationID, setAnimationID] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Track if we've already called onEndReached for the current slide
  const endReachedRef = useRef(false);

  // Reset endReached flag when children length changes (new items loaded)
  useEffect(() => {
    endReachedRef.current = false;
  }, [children.length]);

  useEffect(() => {
    if (!autoPlay || isDragging) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        // If we're at the last slide and onEndReached is defined
        if (prev === children.length - 1 && onEndReached) {
          // Only trigger onEndReached once when we first reach the end
          if (!endReachedRef.current) {
            endReachedRef.current = true;
            onEndReached();
          }
          // Stay on the last slide
          return prev;
        }
        // Reset the flag when not at the end
        if (prev < children.length - 1) {
          endReachedRef.current = false;
        }
        // Otherwise, advance to next slide (with wrap-around)
        return (prev + 1) % children.length;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, children.length, isDragging, onEndReached]);

  const goToSlide = (index: number) => {
    // Reset endReached flag if moving away from the last slide
    if (index < children.length - 1) {
      endReachedRef.current = false;
    }
    setCurrentIndex(index);
    const slideWidthValue = 100 - peekAmount;
    setPrevTranslate(-index * slideWidthValue);
    setCurrentTranslate(-index * slideWidthValue);
    if (onSlideChange) onSlideChange(index);
    // Trigger onEndReached when reaching the last slide
    if (index === children.length - 1 && onEndReached) {
      onEndReached();
    }
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + children.length) % children.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    if (currentIndex === children.length - 1) {
      if (onEndReached) {
        onEndReached();
        // Don't wrap around when onEndReached is defined (infinite scroll mode)
        return;
      }
      // If no onEndReached, wrap around to first slide
      const newIndex = 0;
      goToSlide(newIndex);
    } else {
      const newIndex = currentIndex + 1;
      goToSlide(newIndex);
    }
  };

  const animation = () => {
    if (sliderRef.current) {
      const translateVal = direction === 'rtl' ? -currentTranslate : currentTranslate;
      sliderRef.current.style.transform = `translateX(${translateVal}%)`;
    }
    if (isDragging) {
      setAnimationID(requestAnimationFrame(animation));
    }
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setStartPos(e.touches[0].clientX);
    setAnimationID(requestAnimationFrame(animation));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const currentPosition = e.touches[0].clientX;
    const diff = currentPosition - startPos;
    const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 1;
    const movePercent = (diff / sliderWidth) * 100;
    
    // In RTL, dragging right (positive diff) should move elements to the right (to show lower index)
    // Style is translateX(-currentTranslate). To move right, translateX should become more positive.
    // So -currentTranslate should increase. So currentTranslate should decrease.
    // So positive diff should decrease currentTranslate.
    const finalMove = direction === 'rtl' ? -movePercent : movePercent;
    setCurrentTranslate(prevTranslate + finalMove);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    cancelAnimationFrame(animationID);
    
    const movedBy = currentTranslate - prevTranslate;
    
    if (movedBy < -20 && currentIndex < children.length - 1) {
      goToNext();
    } else if (movedBy > 20 && currentIndex > 0) {
      goToPrevious();
    } else {
      setCurrentTranslate(prevTranslate);
    }
  };

  // Mouse events
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setStartPos(e.clientX);
    setAnimationID(requestAnimationFrame(animation));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const currentPosition = e.clientX;
    const diff = currentPosition - startPos;
    const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 1;
    const movePercent = (diff / sliderWidth) * 100;
    const finalMove = direction === 'rtl' ? -movePercent : movePercent;
    setCurrentTranslate(prevTranslate + finalMove);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    cancelAnimationFrame(animationID);
    
    const movedBy = currentTranslate - prevTranslate;
    
    if (movedBy < -20 && currentIndex < children.length - 1) {
      goToNext();
    } else if (movedBy > 20 && currentIndex > 0) {
      goToPrevious();
    } else {
      setCurrentTranslate(prevTranslate);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Update prevTranslate when currentIndex changes
  useEffect(() => {
    const slideWidthValue = 100 - peekAmount;
    setPrevTranslate(-currentIndex * slideWidthValue);
    setCurrentTranslate(-currentIndex * slideWidthValue);
  }, [currentIndex, peekAmount]);

  const slideWidthValue = 100 - peekAmount;

  return (
    <div className="relative w-full group">
      {/* Slides Container */}
      <div className="overflow-hidden rounded-3xl">
        <div 
          ref={sliderRef}
          className="flex transition-transform ease-out select-none"
          style={{ 
            transform: `translateX(${direction === 'rtl' ? -currentTranslate : currentTranslate}%)`,
            transitionDuration: isDragging ? '0ms' : '500ms',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {children.map((child, index) => (
          <div 
            key={index} 
            className="flex-shrink-0"
            style={{ 
              width: `${slideWidthValue}%`,
              paddingRight: peekAmount > 0 && direction !== 'rtl' ? '1rem' : '0',
              paddingLeft: peekAmount > 0 && direction === 'rtl' ? '1rem' : '0'
            }}
          >
            {child}
          </div>
        ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && children.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); direction === 'rtl' ? goToNext() : goToPrevious(); }}
            className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ease-out hover:scale-110 z-20 ${
              isStandalone 
                ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100' 
                : 'bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md opacity-0 group-hover:opacity-100 border border-white/20'
            }`}
            style={isStandalone ? { color: tokens.colors[mode].text.primary } : undefined}
            aria-label={direction === 'rtl' ? "Next slide" : "Previous slide"}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); direction === 'rtl' ? goToPrevious() : goToNext(); }}
            className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ease-out hover:scale-110 z-20 ${
              isStandalone 
                ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100' 
                : 'bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md opacity-0 group-hover:opacity-100 border border-white/20'
            }`}
            style={isStandalone ? { color: tokens.colors[mode].text.primary } : undefined}
            aria-label={direction === 'rtl' ? "Previous slide" : "Next slide"}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && children.length > 1 && (
        <div className={`flex gap-2 z-10 justify-center ${
          isStandalone ? 'mt-2 sm:mt-4' : 'absolute bottom-4 left-1/2 -translate-x-1/2'
        }`}>
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? `w-8 ${ isStandalone ? 'bg-primary' : 'bg-white' }` 
                  : `w-2 ${ isStandalone ? 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400' : 'bg-white/50 hover:bg-white/75' }`
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
