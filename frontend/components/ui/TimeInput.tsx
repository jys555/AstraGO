'use client';

import { useState, useEffect } from 'react';
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

  // Convert HH:mm to display format
  useEffect(() => {
    if (value && !isFocused) {
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
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value || '');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const inputValue = e.target.value.trim();
    
    // Try to parse HH:mm format
    if (inputValue.includes(':')) {
      const parts = inputValue.split(':');
      if (parts.length === 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const timeValue = `${hours}:${minutes}`;
        const hourNum = parseInt(hours, 10);
        const minNum = parseInt(minutes, 10);
        if (hourNum >= 0 && hourNum < 24 && minNum >= 0 && minNum < 60) {
          onChange(timeValue);
          setDisplayValue(timeValue);
          return;
        }
      }
    }
    
    // If invalid, reset to current value
    if (value) {
      const [hours, minutes] = value.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      setDisplayValue(formatTime(date));
    } else {
      setDisplayValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // If user is typing in HH:mm format
    if (inputValue.includes(':') && inputValue.length >= 5) {
      const parts = inputValue.split(':');
      if (parts.length === 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const hourNum = parseInt(hours, 10);
        const minNum = parseInt(minutes, 10);
        if (hourNum >= 0 && hourNum < 24 && minNum >= 0 && minNum < 60) {
          onChange(`${hours}:${minutes}`);
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
        placeholder={placeholder || 'HH:mm'}
        className={className}
        required={required}
        pattern="\d{2}:\d{2}"
        inputMode="numeric"
      />
      {/* Hidden native time input for mobile time picker */}
      <input
        type="time"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsFocused(false);
        }}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ width: '1px', height: '1px' }}
        aria-hidden="true"
      />
    </div>
  );
}
