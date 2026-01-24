'use client';

import { useState } from 'react';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    id: '1',
    icon: '🚗',
    title: 'Qulay Narxlar',
    description: 'Shaharlararo safarlar uchun eng qulay narxlar',
  },
  {
    id: '2',
    icon: '⏰',
    title: 'Real Vaqt',
    description: 'Real vaqtda o\'rinlar va safarlar haqida ma\'lumot',
  },
  {
    id: '3',
    icon: '💬',
    title: 'Tezkor Aloqa',
    description: 'Haydovchi bilan bevosita aloqa va muzokara',
  },
  {
    id: '4',
    icon: '⭐',
    title: 'Ishonchli',
    description: 'Reytinglangan va ishonchli haydovchilar',
  },
  {
    id: '5',
    icon: '🛡️',
    title: 'Xavfsiz',
    description: 'Barcha haydovchilar tekshirilgan va xavfsiz',
  },
];

export function BenefitsCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <div className="px-4 py-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AstraGO Qulayliklari</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="text-3xl mb-2">{benefit.icon}</div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">{benefit.title}</h4>
            <p className="text-xs text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
