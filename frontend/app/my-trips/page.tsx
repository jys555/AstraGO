'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, MessageCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const statusConfig = {
    ACTIVE: {
      label: 'Faol',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: Clock,
    },
    COMPLETED: {
      label: 'Yakunlangan',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: 'Bekor qilingan',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
    },
    CONFIRMED: {
      label: 'Tasdiqlangan',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Kutilmoqda',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: Clock,
    },
    EXPIRED: {
      label: 'Muddati o\'tgan',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
    },
  };

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
                onClick={() => router.push('/')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {isDriver ? 'Mening Safarlarim' : 'Mening Rezervatsiyalarim'}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
                                    onClick={() => reservation.chat && router.push(`/chat/${reservation.chat.id}`)}
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
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                  Faol ({activeReservation ? 1 : 0})
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                  Tarix (0)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {activeReservation ? (
                  <Card className="p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl">
                    <div className="space-y-4">
                      {/* Driver Info */}
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-gray-100">
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                            {activeReservation.trip.driver.firstName?.[0] || '?'}{activeReservation.trip.driver.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {activeReservation.trip.driver.firstName} {activeReservation.trip.driver.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">Haydovchi</p>
                          {activeReservation.trip.driver.phone && (
                            <p className="text-sm text-gray-600 mt-1">{activeReservation.trip.driver.phone}</p>
                          )}
                        </div>
                        {(() => {
                          const statusInfo = statusConfig[activeReservation.status as keyof typeof statusConfig];
                          const StatusIcon = statusInfo?.icon || Clock;
                          return (
                            <Badge className={`${statusInfo?.color || 'bg-gray-50 text-gray-700'} border`}>
                              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                              {statusInfo?.label || activeReservation.status}
                            </Badge>
                          );
                        })()}
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">{activeReservation.trip.routeFrom}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-900">{activeReservation.trip.routeTo}</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDate(activeReservation.trip.departureWindowStart)} •{' '}
                          {formatTime(activeReservation.trip.departureWindowStart)} -{' '}
                          {formatTime(activeReservation.trip.departureWindowEnd)}
                        </span>
                      </div>

                      {/* Booking Info */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{activeReservation.seatCount}</span> o'rin rezervatsiya qilingan
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        {activeReservation.chat ? (
                          <Button
                            onClick={() => activeReservation.chat && router.push(`/chat/${activeReservation.chat.id}`)}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={async () => {
                              try {
                                const chatData = await apiClient.getChatByReservation(activeReservation.id);
                                router.push(`/chat/${chatData.chat.id}`);
                              } catch (error) {
                                console.error('Chat yaratishda xatolik:', error);
                                openTelegramChat(
                                  activeReservation.trip.driver.username,
                                  activeReservation.trip.driver.phone
                                );
                              }
                            }}
                            className="flex-1 border-gray-200 hover:bg-gray-50 font-semibold py-2.5 rounded-xl"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat yaratish
                          </Button>
                        )}
                        {activeReservation.status === 'CONFIRMED' && (
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/trips/${activeReservation.tripId}`)}
                            className="border-gray-200 hover:bg-gray-50 font-semibold py-2.5 rounded-xl"
                          >
                            Batafsil
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Faol rezervatsiyalar yo'q</h3>
                        <p className="text-gray-600 text-sm">Safar qidirishni boshlang va rezervatsiya qiling</p>
                      </div>
                      <Button
                        className="bg-primary-500 hover:bg-primary-600 text-white mt-4 font-semibold py-2.5 px-6 rounded-xl"
                        onClick={() => router.push('/')}
                      >
                        Safarlarni Qidirish
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarix yo'q</h3>
                      <p className="text-gray-600 text-sm">Yakunlangan va bekor qilingan rezervatsiyalar shu yerda ko'rinadi</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </RegistrationGuard>
  );
}
