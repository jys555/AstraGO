'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TripList } from '@/components/trips/TripList';
import { useTrips } from '@/hooks/useTrips';
import { useReservation } from '@/hooks/useReservation';
import { ReservationPanel } from '@/components/trips/ReservationPanel';
import { TripFilters } from '@/types';
import { Button } from '@/components/ui/button';
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

    // Check if user is trying to reserve their own trip
    const currentUser = userData?.user || (await apiClient.getCurrentUser()).user;
    const trip = data?.trips?.find(t => t.id === tripId);
    if (trip && currentUser?.id === trip.driver.id) {
      alert('Siz o\'z safaringizga rezervatsiya qila olmaysiz.');
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
      } else if (error.message?.includes('own trip') || error.message?.includes('Drivers cannot')) {
        alert('Siz o\'z safaringizga rezervatsiya qila olmaysiz.');
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

  const routeFrom = filters.routeFrom || '';
  const routeTo = filters.routeTo || '';

  return (
    <RegistrationGuard requireRegistration={true}>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mavjud Safarlar</h1>
                {routeFrom && routeTo && (
                  <p className="text-sm text-gray-500">{routeFrom} → {routeTo}</p>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Active Reservation Panel */}
          {reservation && timeRemaining !== null && (
            <div className="mb-6">
              <ReservationPanel
                reservation={reservation}
                timeRemaining={timeRemaining}
                driverResponded={driverResponded}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isLoading={reservationLoading}
              />
            </div>
          )}

          {/* Results Header */}
          {!isLoading && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Topildi <span className="font-semibold text-gray-900">{data?.trips?.length || 0} ta safar</span> qidiruv natijasiga ko'ra
              </p>
            </div>
          )}

          {/* Trip List */}
          <TripList
            trips={data?.trips || []}
            onReserve={handleReserve}
            isLoading={isLoading || reservationLoading}
            filters={filters}
            onFiltersChange={setFilters}
          />

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
