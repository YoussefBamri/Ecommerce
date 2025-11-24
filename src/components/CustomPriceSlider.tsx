import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/Shop.css';

interface CustomPriceSliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
}

const CustomPriceSlider: React.FC<CustomPriceSliderProps> = ({
  value,
  onValueChange,
  step = 1,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const min = 0;
  const max = 1000;

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, []);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((percentage * (max - min) + min) / step) * step;
  }, [step]);

  const handleMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    setIsDragging(thumb);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newValue = getValueFromPosition(e.clientX);
    const [currentMin, currentMax] = value;

    if (isDragging === 'min') {
      const clampedValue = Math.max(0, Math.min(currentMax - step, newValue));
      onValueChange([clampedValue, currentMax]);
    } else if (isDragging === 'max') {
      const clampedValue = Math.max(currentMin + step, Math.min(1000, newValue));
      onValueChange([currentMin, clampedValue]);
    }
  }, [isDragging, value, step, getValueFromPosition, onValueChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return; // Don't handle click if dragging
    const rect = trackRef.current!.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newValue = Math.round((percentage * (max - min) + min) / step) * step;
    const currentSpan = value[1] - value[0];
    const halfSpan = currentSpan / 2;
    let newMin = Math.max(0, newValue - halfSpan);
    let newMax = Math.min(1000, newValue + halfSpan);
    if (newMin === 0) {
      newMax = Math.min(1000, 0 + currentSpan);
    } else if (newMax === 1000) {
      newMin = Math.max(0, 1000 - currentSpan);
    }
    onValueChange([Math.round(newMin), Math.round(newMax)]);
  }, [isDragging, value, min, max, step, onValueChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className="price-slider" ref={trackRef}>
      <div className="slider-track" onClick={handleTrackClick}>
        <div
          className="slider-range"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
      </div>
      <div
        className="slider-thumb slider-thumb-min"
        style={{ left: `${minPercentage}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'min')}
      />
      <div
        className="slider-thumb slider-thumb-max"
        style={{ left: `${maxPercentage}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'max')}
      />
    </div>
  );
};

export default CustomPriceSlider;