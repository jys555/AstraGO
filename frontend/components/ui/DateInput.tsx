'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/dateUtils';

interface DateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export function DateInput({ value, onChange, min, max, className = '', required = false, placeholder }: DateInputProps) {
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
        {/* Display formatted date or placeholder */}
        {value ? (
          <span className="text-gray-700">{displayValue}</span>
        ) : (
          <span className="text-gray-400">{placeholder || 'DD/MM/YYYY'}</span>
        )}
      </div>
      {/* Native date input - completely hidden but clickable */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
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
