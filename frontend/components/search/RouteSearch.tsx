import React, { useState } from 'react';
import { Button } from '../ui/button';
import { STANDARD_ROUTES } from '@/lib/constants';
import { DateInput } from '../ui/DateInput';

interface RouteSearchProps {
  onSearch: (from: string, to: string, date: string, passengerCount?: number, cargoType?: 'PASSENGER' | 'CARGO') => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialPassengerCount?: number;
  initialCargoType?: 'PASSENGER' | 'CARGO';
}

export const RouteSearch: React.FC<RouteSearchProps> = ({
  onSearch,
  initialFrom = '',
  initialTo = '',
  initialDate = '',
  initialPassengerCount = 1,
  initialCargoType = 'PASSENGER',
}) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  // Calculate max date: tomorrow (1 day ahead)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = tomorrow.toISOString().split('T')[0];
  const minDate = today.toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [cargoType, setCargoType] = useState<'PASSENGER' | 'CARGO'>(initialCargoType);
  const [passengerCount, setPassengerCount] = useState(initialPassengerCount || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      // Validate date is not more than 1 day ahead
      if (date) {
        const selectedDate = new Date(date);
        const maxAllowedDate = new Date(tomorrow);
        maxAllowedDate.setHours(23, 59, 59, 999);
        if (selectedDate > maxAllowedDate) {
          alert('Sana ertaga (1 kun) dan oshmasligi kerak');
          return;
        }
      }
      onSearch(from, to, date, cargoType === 'PASSENGER' ? passengerCount : undefined, cargoType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qayerdan
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
            required
          >
            <option value="">Manzilni tanlang</option>
            {STANDARD_ROUTES.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qayerga
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
            required
          >
            <option value="">Manzilni tanlang</option>
            {STANDARD_ROUTES.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turi
          </label>
          <select
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value as 'PASSENGER' | 'CARGO')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
            required
          >
            <option value="PASSENGER">Yo'lovchi</option>
            <option value="CARGO">Yuk (Pochta)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sana
            </label>
            <DateInput
              value={date}
              onChange={setDate}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
              required
              placeholder="DD/MM/YYYY"
            />
          </div>
          {cargoType === 'PASSENGER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yo'lovchilar soni
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
              />
            </div>
          )}
        </div>
      </div>
      <Button type="submit" variant="primary" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-sm">
        Safarlarni Qidirish
      </Button>
    </form>
  );
};
