'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { ReservationPanel } from '@/components/trips/ReservationPanel';
import { useReservation } from '@/hooks/useReservation';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/maps/MapView';
import { RegistrationModal } from '@/components/auth/RegistrationModal';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [showLocationShare, setShowLocationShare] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => apiClient.getTrip(tripId),
  });

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    enabled: false, // Don't fetch automatically - only when needed
  });

  const [showRegistration, setShowRegistration] = useState(false);

  const {
    reservation,
    timeRemaining,
    driverResponded,
    createReservation,
    confirmReservation,
    cancelReservation,
    isLoading: reservationLoading,
  } = useReservation();

  const handleReserve = async () => {
    // Check if user is registered - fetch user data if needed
    if (!userData) {
      const currentUser = await apiClient.getCurrentUser();
      if (!currentUser?.user?.isProfileComplete) {
        setShowRegistration(true);
        return;
      }
    } else if (!userData.user?.isProfileComplete) {
      setShowRegistration(true);
      return;
    }

    try {
      await createReservation(tripId, 1);
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      // If 401 or profile incomplete error, show registration
      if (error.response?.status === 401 || error.message?.includes('profile')) {
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
      setShowLocationShare(true);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (!data?.trip) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Trip not found</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => router.push('/trips')}
        >
          Back to Trips
        </Button>
      </div>
    );
  }

  const trip = data.trip;
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isReservationForThisTrip = reservation?.tripId === tripId;
  const isConfirmed = reservation?.status === 'CONFIRMED';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Active Reservation Panel */}
        {isReservationForThisTrip && reservation && timeRemaining !== null && !isConfirmed && (
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

        {/* Confirmed Reservation - Location Sharing */}
        {isConfirmed && showLocationShare && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-green-800">Reservation Confirmed!</h2>
                <StatusBadge status="confirmed" />
              </div>
              <p className="text-green-700">
                Your reservation has been confirmed. You can now share your location for home pickup.
              </p>
              {trip.pickupType === 'HOME_PICKUP' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          // In a real app, this would share location with driver
                          alert('Location sharing enabled. Driver will receive your location.');
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">Share my location for home pickup</span>
                  </label>
                </div>
              )}
              <Button
                variant="primary"
                onClick={() => router.push('/my-trips')}
              >
                View in My Trips
              </Button>
            </div>
          </Card>
        )}

        {/* Trip Details */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{trip.vehicleType}</h1>
                <p className="text-gray-600">
                  {trip.driver.firstName} {trip.driver.lastName}
                </p>
              </div>
              <StatusBadge
                status={trip.driver.onlineStatus ? 'online' : 'offline'}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary-600 font-semibold text-lg">
                  {trip.routeFrom}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-primary-600 font-semibold text-lg">
                  {trip.routeTo}
                </span>
              </div>

              {/* Map View */}
              <div className="mb-4">
                <MapView
                  from={trip.routeFrom}
                  to={trip.routeTo}
                  readonly={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Departure Window</p>
                  <p className="font-semibold">
                    {formatTime(trip.departureWindowStart)} -{' '}
                    {formatTime(trip.departureWindowEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Available Seats</p>
                  <p className="font-semibold text-primary-600">
                    {trip.availableSeats} / {trip.totalSeats}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {trip.pickupType === 'HOME_PICKUP' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Home Pickup Available
                  </span>
                )}
                {trip.deliveryType === 'CARGO_ACCEPTED' && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Cargo Accepted
                  </span>
                )}
                {trip.driver.driverMetrics && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ⭐ Ranking: {trip.driver.driverMetrics.rankingScore.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {!isReservationForThisTrip && (
              <div className="border-t pt-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleReserve}
                  disabled={trip.availableSeats === 0 || reservation !== null}
                  isLoading={reservationLoading}
                >
                  {trip.availableSeats === 0
                    ? 'No Seats Available'
                    : reservation
                    ? 'You have an active reservation'
                    : 'Chat & Reserve (10 min)'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={() => {
          // After registration, try to create reservation again
          if (tripId) {
            handleReserve();
          }
        }}
      />
    </main>
    </RegistrationGuard>
  );
}

export default TripDetailPage;
