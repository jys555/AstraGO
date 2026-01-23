'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { StatusBadge } from '../ui/StatusBadge';

export const Header: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = data?.user;
  const roleLabels = {
    PASSENGER: 'Passenger',
    DRIVER: 'Driver',
    BOTH: 'Driver & Passenger',
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            AstraGo
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Search
            </Link>
            <Link
              href="/my-trips"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              My Trips
            </Link>
            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <span className="text-sm">
                  {user.firstName || user.username || 'Profile'}
                </span>
                {user.role && (
                  <StatusBadge
                    status={user.role === 'DRIVER' ? 'active' : user.role === 'BOTH' ? 'online' : 'inactive'}
                    label={roleLabels[user.role]}
                  />
                )}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
