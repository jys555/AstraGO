'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

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

  const handleDisplayClick = () => {
    // Trigger native time picker
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
      {/* Display input with formatted time */}
      <input
        ref={displayInputRef}
        type="text"
        value={displayValue}
        onFocus={handleDisplayFocus}
        onBlur={handleDisplayBlur}
        onClick={handleDisplayClick}
        readOnly
        placeholder={placeholder || 'HH:mm'}
        className={className}
        required={required}
        style={{ cursor: 'pointer' }}
      />
      {/* Hidden native time input for picker */}
      <input
        ref={nativeInputRef}
        type="time"
        value={value}
        onChange={handleNativeChange}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
