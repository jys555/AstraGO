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
  });

  const user = data?.user;
  const isProfileComplete = user?.isProfileComplete ?? false;

  // If user is not registered, show guest welcome or registration modal
  if (!isLoading && !error && user && !isProfileComplete) {
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

  // If loading or error, show children (let other components handle loading/error states)
  return <>{children}</>;
}
