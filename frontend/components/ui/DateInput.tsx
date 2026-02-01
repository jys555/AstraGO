'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/dateUtils';

interface DateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  min?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export function DateInput({ value, onChange, min, className = '', required = false, placeholder }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update display value when value changes
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          setDisplayValue(formatDate(date));
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
      {/* Native date input - visible box with transparent text */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        className={className}
        required={required}
        style={{
          color: 'transparent',
          cursor: 'pointer',
        }}
      />
      {/* Display formatted date - overlay on top */}
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
          {placeholder || 'DD/MM/YYYY'}
        </div>
      )}
    </div>
  );
}
