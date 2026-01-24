'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TripList } from '@/components/trips/TripList';
import { useTrips } from '@/hooks/useTrips';
import { useReservation } from '@/hooks/useReservation';
import { ReservationPanel } from '@/components/trips/ReservationPanel';
import { TripFilters } from '@/types';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

function TripsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<TripFilters>({
    routeFrom: searchParams.get('from') || undefined,
    routeTo: searchParams.get('to') || undefined,
    date: searchParams.get('date') || undefined,
  });

  const { data, isLoading, error } = useTrips(filters);
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    enabled: false, // Don't fetch automatically - only when needed
  });

  const [showRegistration, setShowRegistration] = useState(false);
  const [pendingTripId, setPendingTripId] = useState<string | null>(null);

  const {
    reservation,
    timeRemaining,
    driverResponded,
    createReservation,
    confirmReservation,
    cancelReservation,
    isLoading: reservationLoading,
  } = useReservation();

  const handleReserve = async (tripId: string) => {
    // Check if user is registered - fetch user data if needed
    if (!userData) {
      const currentUser = await apiClient.getCurrentUser();
      if (!currentUser?.user?.isProfileComplete) {
        setPendingTripId(tripId);
        setShowRegistration(true);
        return;
      }
    } else if (!userData.user?.isProfileComplete) {
      setPendingTripId(tripId);
      setShowRegistration(true);
      return;
    }

    try {
      await createReservation(tripId, 1);
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      // If 401 or profile incomplete error, show registration
      if (error.response?.status === 401 || error.message?.includes('profile')) {
        setPendingTripId(tripId);
        setShowRegistration(true);
      } else {
        alert('Rezervatsiya yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    }
  };

  const handleConfirm = async () => {
    if (!reservation) return;
    try {
      await confirmReservation(reservation.id);
      router.push('/my-trips');
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      alert('Failed to confirm reservation. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    try {
      await cancelReservation(reservation.id);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('Failed to cancel reservation. Please try again.');
    }
  };

  if (error) {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          <AppHeader />
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-red-600">Error loading trips. Please try again.</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push('/')}
            >
              Back to Search
            </Button>
          </div>
        </div>
        <BottomNav />
      </RegistrationGuard>
    );
  }

  return (
    <RegistrationGuard requireRegistration={true}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <AppHeader />
        
        <main>
          {/* Active Reservation Panel */}
          {reservation && timeRemaining !== null && (
            <div className="bg-yellow-50 border-b border-yellow-200">
              <div className="container mx-auto px-4 py-4">
                <ReservationPanel
                  reservation={reservation}
                  timeRemaining={timeRemaining}
                  driverResponded={driverResponded}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  isLoading={reservationLoading}
                />
              </div>
            </div>
          )}

          {/* Trip List */}
          <div className="px-4 py-4">
            <TripList
              trips={data?.trips || []}
              onReserve={handleReserve}
              isLoading={isLoading || reservationLoading}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => {
              setShowRegistration(false);
              setPendingTripId(null);
            }}
            onSuccess={() => {
              // After registration, try to create reservation again
              if (pendingTripId) {
                handleReserve(pendingTripId);
                setPendingTripId(null);
              }
            }}
          />
        </main>
      </div>
      
      <BottomNav />
    </RegistrationGuard>
  );
}

export default TripsPage;
