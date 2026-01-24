'use client';

import { useEffect, useState } from 'react';
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false, // Don't retry on 401
    // Don't throw error on 401 - it's expected for unregistered users
    throwOnError: false,
  });

  const user = data?.user;
  const isProfileComplete = user?.isProfileComplete ?? false;

  // If user is not registered (error 401 or user not complete), show guest welcome
  // 401 error means user doesn't exist yet - this is normal for first-time users
  if (!isLoading && (error || !user || !isProfileComplete)) {
    if (requireRegistration) {
      return (
        <>
          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => setShowRegistration(false)}
            onSuccess={() => {
              // Registration successful, component will re-render
            }}
          />
          {children}
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
            // Registration successful, component will re-render
          }}
        />
      </>
    );
  }

  // If loading, show children (let other components handle loading states)
  // If user is registered, show children
  return <>{children}</>;
}
