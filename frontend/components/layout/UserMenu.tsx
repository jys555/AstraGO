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

  // Show user info if available
  if (user) {
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
              {user.role ? roleLabels[user.role] : 'Ro\'yxatdan o\'tish kerak'}
            </div>
          </div>
        </Link>
        {user.role && (
          <StatusBadge
            status={user.role === 'DRIVER' ? 'active' : user.role === 'BOTH' ? 'online' : 'inactive'}
            label={roleLabels[user.role]}
          />
        )}
      </div>
    );
  }

  // Show Telegram user if available but not synced with backend
  if (telegramUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
          {telegramUser.first_name?.[0] || telegramUser.username?.[0] || 'U'}
        </div>
        <Link
          href="/profile"
          className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          {telegramUser.first_name || telegramUser.username || 'User'}
        </Link>
      </div>
    );
  }

  // No user data
  return (
    <Link
      href="/profile"
      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
    >
      Profil
    </Link>
  );
}
