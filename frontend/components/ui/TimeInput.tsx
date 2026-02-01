'use client';

import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/lib/dateUtils';

interface TimeInputProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export function TimeInput({ value, onChange, className = '', required = false, placeholder }: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update display value when value changes
  useEffect(() => {
    if (value) {
      try {
        const [hours, minutes] = value.split(':');
        if (hours && minutes) {
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          setDisplayValue(formatTime(date));
        } else {
          setDisplayValue('');
        }
      } catch {
        setDisplayValue('');
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleWrapperClick = (e: React.MouseEvent) => {
    // Prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Focus and click the native input to trigger picker
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.click();
      
      // Try to open picker (may fail in iframe, but click should work)
      try {
        if (inputRef.current.showPicker) {
          inputRef.current.showPicker();
        }
      } catch (error) {
        // showPicker might fail in iframe, but click should work
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative" onClick={handleWrapperClick}>
      {/* Display formatted time - always visible when value exists */}
      {value && (
        <div 
          className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-700 z-10"
        >
          {displayValue}
        </div>
      )}
      {/* Placeholder when no value */}
      {!value && (
        <div 
          className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-400 z-10"
        >
          {placeholder || 'HH:mm'}
        </div>
      )}
      {/* Native time input - completely hidden but clickable */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={handleChange}
        className={className}
        required={required}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          zIndex: 1,
          pointerEvents: 'auto',
        }}
        onClick={(e) => {
          // Allow native input to handle click
          e.stopPropagation();
        }}
      />
    </div>
  );
}
