'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ReservationPanel } from '@/components/trips/ReservationPanel';
import { useReservation } from '@/hooks/useReservation';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { MapView } from '@/components/maps/MapView';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => apiClient.getTrip(tripId),
  });

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const completeTripMutation = useMutation({
    mutationFn: () => apiClient.completeTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['my-trips', 'driver'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      alert('Safar muvaffaqiyatli yakunlandi');
      router.push('/my-trips');
    },
    onError: (error: any) => {
      console.error('Safarni yakunlashda xatolik:', error);
      alert('Safarni yakunlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    },
  });

  const handleCompleteTrip = async () => {
    if (!confirm('Safarni yakunlashni xohlaysizmi? Barcha faol chatlar arxivga o\'tkaziladi.')) {
      return;
    }
    completeTripMutation.mutate();
  };

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
    // Check if user is registered
    if (!userData || !userData.user?.firstName || !userData.user?.phone) {
      // Store trip ID for after registration
      sessionStorage.setItem('pendingReservationTripId', tripId);
      setShowRegistration(true);
      return;
    }

    try {
      await createReservation(tripId, 1);
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      // If 401 or profile incomplete error, show registration
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('profile')) {
        sessionStorage.setItem('pendingReservationTripId', tripId);
        setShowRegistration(true);
      } else {
        alert('Rezervatsiya yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    }
  };

  const handleConfirm = async () => {
    if (!reservation) return;
    
    // Check if user is registered
    if (!userData || !userData.user?.firstName || !userData.user?.phone) {
      // Store reservation ID for after registration
      sessionStorage.setItem('pendingConfirmReservationId', reservation.id);
      setShowRegistration(true);
      return;
    }

    try {
      await confirmReservation(reservation.id);
      setShowLocationShare(true);
    } catch (error: any) {
      console.error('Failed to confirm reservation:', error);
      // If 401 or profile incomplete error, show registration
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('profile')) {
        if (reservation) {
          sessionStorage.setItem('pendingConfirmReservationId', reservation.id);
          setShowRegistration(true);
        }
      } else {
        alert('Rezervatsiyani tasdiqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    }
  };

  const handleRegistrationSuccess = () => {
    // After registration, continue from where user left off
    const pendingReservationTripId = sessionStorage.getItem('pendingReservationTripId');
    const pendingConfirmReservationId = sessionStorage.getItem('pendingConfirmReservationId');
    
    if (pendingReservationTripId) {
      sessionStorage.removeItem('pendingReservationTripId');
      // Reload page to retry reservation
      window.location.reload();
    } else if (pendingConfirmReservationId) {
      sessionStorage.removeItem('pendingConfirmReservationId');
      // Reload page to retry confirm
      window.location.reload();
    } else {
      window.location.reload();
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Safar ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!data?.trip) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Safar topilmadi</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => router.push('/trips')}
        >
          Safarlarga Qaytish
        </Button>
      </div>
    );
  }

  const trip = data.trip;
  const currentUser = userData?.user;
  const isOwnTrip = currentUser?.id && trip.driverId && currentUser.id === trip.driverId;
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isReservationForThisTrip = reservation?.tripId === tripId;
  const isConfirmed = reservation?.status === 'CONFIRMED';

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Safar Tafsilotlari</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <h2 className="text-xl font-bold text-green-800">Rezervatsiya Tasdiqlandi!</h2>
                <StatusBadge status="confirmed" />
              </div>
              <p className="text-green-700">
                Rezervatsiyangiz tasdiqlandi. Endi uydan olish uchun joylashuvingizni baham ko'rishingiz mumkin.
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

            {!isReservationForThisTrip && !isOwnTrip && (
              <div className="border-t pt-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleReserve}
                  disabled={trip.availableSeats === 0 || reservation !== null}
                  isLoading={reservationLoading}
                >
                  {trip.availableSeats === 0
                    ? 'Barcha o\'rinlar band'
                    : reservation
                    ? 'Sizda faol rezervatsiya bor'
                    : 'Chat & Rezervatsiya (10 min)'}
                </Button>
              </div>
            )}
            {isOwnTrip && (
              <div className="border-t pt-4 space-y-3">
                {trip.status === 'ACTIVE' && (
                  <Button
                    variant="primary"
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 rounded-xl"
                    onClick={handleCompleteTrip}
                    disabled={completeTripMutation.isPending}
                    isLoading={completeTripMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Safarni Yakunlash
                  </Button>
                )}
                {trip.status !== 'ACTIVE' && (
                  <div className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl text-center text-sm">
                    {trip.status === 'COMPLETED' ? 'Safar yakunlangan' : trip.status === 'CANCELLED' ? 'Safar bekor qilingan' : 'Bu sizning safaringiz'}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
        </main>
      </div>
      
      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </RegistrationGuard>
  );
}
