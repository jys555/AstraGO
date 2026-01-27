import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { STANDARD_ROUTES } from '@/lib/constants';

interface RouteSearchProps {
  onSearch: (from: string, to: string, date: string) => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

export const RouteSearch: React.FC<RouteSearchProps> = ({
  onSearch,
  initialFrom = '',
  initialTo = '',
  initialDate = '',
}) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      onSearch(from, to, date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qayerdan
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qayerga
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sana
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
            required
          />
        </div>
      </div>
      <Button type="submit" variant="primary" className="w-full md:w-auto">
        Safarlarni Qidirish
      </Button>
    </form>
  );
};
