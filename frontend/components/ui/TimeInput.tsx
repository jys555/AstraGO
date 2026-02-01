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
      {/* Visible box - styled like input */}
      <div
        className={className}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          minHeight: '2.5rem',
          backgroundColor: 'white',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Display formatted time or placeholder */}
        {value ? (
          <span className="text-gray-700">{displayValue}</span>
        ) : (
          <span className="text-gray-400">{placeholder || 'HH:mm'}</span>
        )}
      </div>
      {/* Native time input - completely hidden but clickable */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={handleChange}
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
          e.stopPropagation();
        }}
      />
    </div>
  );
}
