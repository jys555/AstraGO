import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'active' | 'inactive' | 'confirmed' | 'pending' | 'expired';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    online: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', defaultLabel: 'Onlayn' },
    offline: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', defaultLabel: 'Oflayn' },
    active: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', defaultLabel: 'Faol' },
    inactive: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', defaultLabel: 'Faol Emas' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', defaultLabel: 'Tasdiqlangan' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', defaultLabel: 'Kutilmoqda' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', defaultLabel: 'Muddati O\'tgan' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.defaultLabel}
    </span>
  );
};
