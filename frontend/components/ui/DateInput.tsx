'use client';

import { useState, useEffect } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  useEffect(() => {
    if (value && !isFocused) {
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
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show native date picker format when focused
    setDisplayValue(value || '');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const inputValue = e.target.value;
    
    // Try to parse DD/MM/YYYY format
    if (inputValue.includes('/')) {
      const parts = inputValue.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          onChange(isoDate);
          setDisplayValue(formatDate(date));
          return;
        }
      }
    }
    
    // Try to parse YYYY-MM-DD format
    if (inputValue.includes('-')) {
      const date = new Date(inputValue + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        onChange(inputValue);
        setDisplayValue(formatDate(date));
        return;
      }
    }
    
    // If invalid, reset to current value
    if (value) {
      const date = new Date(value + 'T00:00:00');
      setDisplayValue(formatDate(date));
    } else {
      setDisplayValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // If user is typing in DD/MM/YYYY format
    if (inputValue.includes('/') && inputValue.length >= 10) {
      const parts = inputValue.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          onChange(isoDate);
        }
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={isFocused ? (value || '') : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || 'DD/MM/YYYY'}
        min={min}
        className={className}
        required={required}
        pattern="\d{2}/\d{2}/\d{4}"
        inputMode="numeric"
      />
      {/* Hidden native date input for mobile date picker */}
      <input
        type="date"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsFocused(false);
        }}
        min={min}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ width: '1px', height: '1px' }}
        aria-hidden="true"
      />
    </div>
  );
}
