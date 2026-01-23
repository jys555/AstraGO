'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TripList } from '@/components/trips/TripList';
import { useTrips } from '@/hooks/useTrips';
import { useReservation } from '@/hooks/useReservation';
import { ReservationPanel } from '@/components/trips/ReservationPanel';
import { TripFilters } from '@/types';
import { Button } from '@/components/ui/Button';

export default function TripsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<TripFilters>({
    routeFrom: searchParams.get('from') || undefined,
    routeTo: searchParams.get('to') || undefined,
    date: searchParams.get('date') || undefined,
  });

  const { data, isLoading, error } = useTrips(filters);
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
    try {
      await createReservation(tripId, 1);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert('Failed to create reservation. Please try again.');
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
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
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
      <TripList
        trips={data?.trips || []}
        onReserve={handleReserve}
        isLoading={isLoading || reservationLoading}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </main>
  );
}
