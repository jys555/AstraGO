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
      try {
        // Try showPicker first (works in modern browsers)
        if (nativeInputRef.current.showPicker) {
          nativeInputRef.current.showPicker();
        } else {
          // Fallback: focus and click
          nativeInputRef.current.focus();
          nativeInputRef.current.click();
        }
      } catch (error) {
        // If showPicker fails (e.g., in iframe), use fallback
        console.log('showPicker not available, using fallback');
        nativeInputRef.current.focus();
        nativeInputRef.current.click();
      }
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
        try {
          if (nativeInputRef.current?.showPicker) {
            nativeInputRef.current.showPicker();
          } else {
            nativeInputRef.current?.focus();
            nativeInputRef.current?.click();
          }
        } catch (error) {
          // Fallback if showPicker fails
          nativeInputRef.current?.focus();
          nativeInputRef.current?.click();
        }
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
      {/* Native date input for picker - positioned to overlay */}
      <input
        ref={nativeInputRef}
        type="date"
        value={value}
        onChange={handleNativeChange}
        min={min}
        className="absolute inset-0 opacity-0 cursor-pointer"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          zIndex: 1,
        }}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        onClick={(e) => {
          // Prevent event bubbling
          e.stopPropagation();
        }}
      />
    </div>
  );
}
