'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RegistrationModal } from './RegistrationModal';

interface RegistrationGuardProps {
  children: React.ReactNode;
  requireRegistration?: boolean; // If true, show registration modal instead of app
}

/**
 * Guard component that shows app directly for new users
 * Registration modal appears when user tries to interact
 */
export function RegistrationGuard({ children, requireRegistration = false }: RegistrationGuardProps) {
  const [showRegistration, setShowRegistration] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false, // Don't retry on 401
    // Don't refetch automatically - wait for user to register
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const user = data?.user;
  // User is registered if firstName and phone are present
  const isProfileComplete = !!(user?.firstName && user?.phone);

  // Show loading state - don't flash content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // If user is not registered (null or not complete), show app without auto-opening modal
  // Registration modal will open when user tries to reserve/confirm/create trip
  if (!user || !isProfileComplete) {
    return (
      <>
        {children}
      </>
    );
  }

  // User is registered - show children
  return <>{children}</>;
}
