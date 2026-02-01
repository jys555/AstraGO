'use client';

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
  // Use native date input for picker, but display formatted value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        className={className}
        required={required}
        style={{
          colorScheme: 'light',
        }}
      />
      {/* Display formatted date overlay when not focused */}
      {value && (
        <div
          className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-700"
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          {formatDate(new Date(value + 'T00:00:00'))}
        </div>
      )}
    </div>
  );
}
