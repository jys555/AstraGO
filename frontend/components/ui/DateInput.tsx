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

  const handleWrapperClick = () => {
    // Focus the native input to trigger picker
    if (inputRef.current) {
      inputRef.current.focus();
      // Try to open picker
      try {
        if (inputRef.current.showPicker) {
          inputRef.current.showPicker();
        }
      } catch (error) {
        // showPicker might fail in iframe, but focus should work
        console.log('showPicker not available');
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative" onClick={handleWrapperClick}>
      {/* Display formatted date */}
      <div 
        className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-700 z-10"
        style={{ 
          display: value ? 'flex' : 'none',
        }}
      >
        {displayValue}
      </div>
      {/* Native date input */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        className={className}
        required={required}
        style={{
          color: value ? 'transparent' : 'inherit',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
