'use client';

import { useState, useRef, useEffect } from 'react';
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
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

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

  const handleDisplayClick = () => {
    // Trigger native date picker
    if (nativeInputRef.current) {
      nativeInputRef.current.showPicker?.();
      nativeInputRef.current.focus();
      nativeInputRef.current.click();
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsFocused(false);
  };

  const handleDisplayFocus = () => {
    setIsFocused(true);
    // Trigger native picker
    if (nativeInputRef.current) {
      setTimeout(() => {
        nativeInputRef.current?.showPicker?.();
        nativeInputRef.current?.focus();
        nativeInputRef.current?.click();
      }, 0);
    }
  };

  const handleDisplayBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative">
      {/* Display input with formatted date */}
      <input
        ref={displayInputRef}
        type="text"
        value={displayValue}
        onFocus={handleDisplayFocus}
        onBlur={handleDisplayBlur}
        onClick={handleDisplayClick}
        readOnly
        placeholder={placeholder || 'DD/MM/YYYY'}
        className={className}
        required={required}
        style={{ cursor: 'pointer' }}
      />
      {/* Hidden native date input for picker */}
      <input
        ref={nativeInputRef}
        type="date"
        value={value}
        onChange={handleNativeChange}
        min={min}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
