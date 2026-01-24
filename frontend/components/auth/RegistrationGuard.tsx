'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { GuestWelcome } from './GuestWelcome';
import { RegistrationModal } from './RegistrationModal';

interface RegistrationGuardProps {
  children: React.ReactNode;
  requireRegistration?: boolean; // If true, show registration modal instead of guest welcome
}

/**
 * Guard component that shows guest welcome or registration modal
 * for users who haven't completed registration
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

  // If user is not registered (null or not complete), show guest welcome
  // null means user doesn't exist yet - this is normal for first-time users
  if (!user || !isProfileComplete) {
    if (requireRegistration) {
      return (
        <>
          {children}
          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => setShowRegistration(false)}
            onSuccess={() => {
              // Registration successful, invalidate query to refetch
              window.location.reload(); // Simple reload to ensure fresh state
            }}
          />
        </>
      );
    }
    return (
      <>
        <GuestWelcome onRegister={() => setShowRegistration(true)} />
        <RegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            // Registration successful, invalidate query to refetch
            window.location.reload(); // Simple reload to ensure fresh state
          }}
        />
      </>
    );
  }

  // User is registered - show children
  return <>{children}</>;
}
