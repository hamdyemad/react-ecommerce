import React, { useEffect, useRef, useState } from 'react';
import { tokens } from '@/tokens';
import { cn } from '@/utils/cn';

export interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minDistance?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  minDistance = 0,
  value,
  onChange,
  className,
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newVal: [number, number] = [Math.min(val, localValue[1] - minDistance), localValue[1]];
    setLocalValue(newVal);
    onChange(newVal);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newVal: [number, number] = [localValue[0], Math.max(val, localValue[0] + minDistance)];
    setLocalValue(newVal);
    onChange(newVal);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div ref={containerRef} className={cn('w-full select-none py-2', className)}>
      <style>{`
        .ds-range-slider {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0;
          width: 100%;
          height: 6px;
          background: transparent;
          pointer-events: none;
          outline: none;
        }
        .ds-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #6366f1;
          box-shadow: 0 2px 6px rgba(99,102,241,0.35), 0 0 0 3px rgba(99,102,241,0.12);
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ds-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(99,102,241,0.5), 0 0 0 5px rgba(99,102,241,0.15);
        }
        .ds-range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #6366f1;
          box-shadow: 0 2px 6px rgba(99,102,241,0.35);
          cursor: pointer;
          pointer-events: auto;
        }
      `}</style>

      {/* Track container: overflow visible so thumbs at 0% and 100% aren't clipped */}
      <div className="relative w-full" style={{ height: '20px', overflow: 'visible' }}>
        {/* Grey background track */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700"
          style={{ height: '6px' }}
        />

        {/* Colored active range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            height: '6px',
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            background: tokens.gradients.primary,
            boxShadow: '0 0 8px rgba(99,102,241,0.4)',
          }}
        />

        {/* Min range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="ds-range-slider"
          style={{ zIndex: 3 }}
        />

        {/* Max range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="ds-range-slider"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};
