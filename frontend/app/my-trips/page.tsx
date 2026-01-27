'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { openTelegramChat } from '@/lib/telegram';
import { useReservation } from '@/hooks/useReservation';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Trip } from '@/types';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function MyTripsPage() {
  const router = useRouter();
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const user = userData?.user;
  const isDriver = user?.role === 'DRIVER';

  // For passengers: Get active reservation
  const { reservation: activeReservation } = useReservation();

  // For drivers: Get trips created by driver
  const { data: driverTripsData, isLoading: driverTripsLoading } = useQuery({
    queryKey: ['my-trips', 'driver'],
    queryFn: () => apiClient.getMyTripsAsDriver(),
    enabled: isDriver === true,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTripStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusBadge status="active" label="Faol" />;
      case 'COMPLETED':
        return <StatusBadge status="confirmed" label="Yakunlangan" />;
      case 'CANCELLED':
        return <StatusBadge status="expired" label="Bekor qilingan" />;
      default:
        return null;
    }
  };

  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <StatusBadge status="confirmed" label="Tasdiqlangan" />;
      case 'PENDING':
        return <StatusBadge status="pending" label="Kutilmoqda" />;
      case 'EXPIRED':
        return <StatusBadge status="expired" label="Muddati o'tgan" />;
      case 'CANCELLED':
        return <StatusBadge status="expired" label="Bekor qilingan" />;
      default:
        return null;
    }
  };

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <AppHeader />
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            {isDriver ? 'Mening Safarlarim' : 'Mening Rezervatsiyalarim'}
          </h1>

          {isDriver ? (
            // Driver view: Show trips created by driver
            <>
              {driverTripsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Yuklanmoqda...</p>
                </div>
              ) : driverTripsData?.trips && driverTripsData.trips.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">Hali safar yaratilmagan</p>
                    <p className="text-gray-500 text-sm mb-6">
                      Yangi safar yaratishni boshlang
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/trips/create')}
                    >
                      Safar Yaratish
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {driverTripsData?.trips.map((trip: Trip) => (
                    <Card key={trip.id}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {trip.routeFrom} → {trip.routeTo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(trip.departureWindowStart)} •{' '}
                              {formatTime(trip.departureWindowStart)} -{' '}
                              {formatTime(trip.departureWindowEnd)}
                            </p>
                          </div>
                          {getTripStatusBadge(trip.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Mashina turi</p>
                            <p className="font-semibold text-gray-900">{trip.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Bo'sh o'rinlar</p>
                            <p className="font-semibold text-gray-900">
                              {trip.availableSeats} / {trip.totalSeats}
                            </p>
                          </div>
                        </div>

                        {trip.reservations && trip.reservations.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                              Rezervatsiyalar: {trip.reservations.length}
                            </p>
                            {trip.reservations.map((reservation: any) => (
                              <div key={reservation.id} className="flex items-center justify-between text-xs text-blue-800">
                                <span>
                                  {reservation.passenger.firstName} {reservation.passenger.lastName} - {reservation.seatCount} o'rin
                                </span>
                                {reservation.chat ? (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => router.push(`/chat/${reservation.chat.id}`)}
                                    className="ml-2"
                                  >
                                    Chat
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const chatData = await apiClient.getChatByReservation(reservation.id);
                                        router.push(`/chat/${chatData.chat.id}`);
                                      } catch (error) {
                                        console.error('Chat yaratishda xatolik:', error);
                                      }
                                    }}
                                    className="ml-2"
                                  >
                                    Chat yaratish
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/trips/${trip.id}`)}
                          >
                            Batafsil ko'rish
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Passenger view: Show reservations
            <>
              {activeReservation ? (
                <div className="space-y-4">
                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {activeReservation.trip.routeFrom} → {activeReservation.trip.routeTo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(activeReservation.trip.departureWindowStart)} •{' '}
                            {formatTime(activeReservation.trip.departureWindowStart)} -{' '}
                            {formatTime(activeReservation.trip.departureWindowEnd)}
                          </p>
                        </div>
                        {getReservationStatusBadge(activeReservation.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Haydovchi</p>
                          <p className="font-semibold text-gray-900">
                            {activeReservation.trip.driver.firstName}{' '}
                            {activeReservation.trip.driver.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">O'rinlar</p>
                          <p className="font-semibold text-gray-900">{activeReservation.seatCount}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {activeReservation.chat ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/chat/${activeReservation.chat.id}`)}
                          >
                            Chatga o'tish
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const chatData = await apiClient.getChatByReservation(activeReservation.id);
                                router.push(`/chat/${chatData.chat.id}`);
                              } catch (error) {
                                console.error('Chat yaratishda xatolik:', error);
                                // Fallback to Telegram chat
                                openTelegramChat(
                                  activeReservation.trip.driver.username,
                                  activeReservation.trip.driver.phone
                                );
                              }
                            }}
                          >
                            Chat yaratish
                          </Button>
                        )}
                        {activeReservation.status === 'CONFIRMED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/trips/${activeReservation.tripId}`)
                            }
                          >
                            Batafsil ko'rish
                          </Button>
                        )}
                      </div>

                      {activeReservation.status === 'PENDING' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            Rezervatsiya kutilmoqda. Muzokarani yakunlang va tasdiqlang.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">Hali rezervatsiya yo'q</p>
                    <p className="text-gray-500 text-sm mb-6">
                      Safar qidirishni boshlang va rezervatsiya qiling
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/')}
                    >
                      Safarlarni Qidirish
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </RegistrationGuard>
  );
}
