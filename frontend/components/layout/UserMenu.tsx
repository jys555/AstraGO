'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { StatusBadge } from '../ui/StatusBadge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTelegramUser } from '@/lib/telegram';

export function UserMenu() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    refetchOnWindowFocus: false,
    // Don't throw error on 401 - it's expected for unregistered users
    throwOnError: false,
  });

  const user = data?.user;
  const telegramUser = getTelegramUser();

  const roleLabels = {
    PASSENGER: 'Yo\'lovchi',
    DRIVER: 'Haydovchi',
    BOTH: 'Haydovchi & Yo\'lovchi',
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show user info only if user is registered (profile complete)
  if (user && user.isProfileComplete) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
            {user.firstName?.[0] || user.username?.[0] || 'U'}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">
              {user.firstName || user.username || 'User'}
            </div>
            <div className="text-xs text-gray-500">
              {roleLabels[user.role]}
            </div>
          </div>
        </Link>
        <StatusBadge
          status={user.role === 'DRIVER' ? 'active' : user.role === 'BOTH' ? 'online' : 'inactive'}
          label={roleLabels[user.role]}
        />
      </div>
    );
  }

  // User not registered - don't show Telegram data, just show "Profil" link
  // RegistrationGuard will handle showing registration modal
  return (
    <Link
      href="/profile"
      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
    >
      Profil
    </Link>
  );
}
