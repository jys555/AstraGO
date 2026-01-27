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
    // User is registered if firstName and phone are present
    if (!userData) {
      const currentUser = await apiClient.getCurrentUser();
      if (!currentUser || !currentUser.user?.firstName || !currentUser.user?.phone) {
        setPendingTripId(tripId);
        setShowRegistration(true);
        return;
      }
    } else if (!userData.user || !userData.user.firstName || !userData.user.phone) {
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
      console.error('Rezervatsiyani tasdiqlashda xatolik:', error);
      alert('Rezervatsiyani tasdiqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    try {
      await cancelReservation(reservation.id);
    } catch (error) {
      console.error('Rezervatsiyani bekor qilishda xatolik:', error);
      alert('Rezervatsiyani bekor qilishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  if (error) {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          <AppHeader />
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-red-600">Safarlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push('/')}
            >
              Qidirishga Qaytish
            </Button>
          </div>
        </div>
      </RegistrationGuard>
    );
  }

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const user = userData?.user;
  
  // Block drivers from searching trips
  if (user && user.role === 'DRIVER') {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          <AppHeader />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-yellow-900 mb-2">Siz haydovchisiz</h2>
              <p className="text-yellow-800 mb-4">
                Haydovchilar safarlarni qidira olmaydi va rezervatsiya qila olmaydi. Faqat safar yaratishingiz mumkin.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/trips/create')}
              >
                Safar Yaratish
              </Button>
            </div>
          </div>
        </div>
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
    </RegistrationGuard>
  );
}

export default TripsPage;
