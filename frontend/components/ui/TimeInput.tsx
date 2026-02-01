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


  return (
    <div ref={wrapperRef} className="relative">
      {/* Native time input - visible box with transparent text */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={handleChange}
        className={className}
        required={required}
        style={{
          color: 'transparent',
          cursor: 'pointer',
        }}
      />
      {/* Display formatted time - overlay on top */}
      {value && (
        <div 
          className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-700"
          style={{
            zIndex: 10,
          }}
        >
          {displayValue}
        </div>
      )}
      {/* Placeholder when no value */}
      {!value && (
        <div 
          className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-400"
          style={{
            zIndex: 10,
          }}
        >
          {placeholder || 'HH:mm'}
        </div>
      )}
    </div>
  );
}
