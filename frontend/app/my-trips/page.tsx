'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, MessageCircle, Clock, CheckCircle2, XCircle, Star } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useReservation } from '@/hooks/useReservation';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Trip, Reservation } from '@/types';
import { ReviewModal } from '@/components/trips/ReviewModal';
import { formatDate, formatTime } from '@/lib/dateUtils';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function MyTripsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const user = userData?.user;
  const isDriver = user?.role === 'DRIVER';

  const createReviewMutation = useMutation({
    mutationFn: ({ reservationId, rating, reason, comment }: { reservationId: string; rating: number; reason?: string; comment?: string }) =>
      apiClient.createReview(reservationId, rating, reason, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations', 'passenger'] });
      setReviewModalOpen(false);
      setSelectedReservation(null);
      alert('Baholash muvaffaqiyatli yuborildi!');
    },
    onError: (error: any) => {
      console.error('Baholash yuborishda xatolik:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Baholash yuborishda xatolik yuz berdi.';
      if (errorMessage.includes('already exists')) {
        alert('Bu safar uchun allaqachon baholash berilgan.');
        // Refresh data to get updated review status
        queryClient.invalidateQueries({ queryKey: ['my-reservations', 'passenger'] });
        setReviewModalOpen(false);
        setSelectedReservation(null);
      } else {
        alert(`Baholash yuborishda xatolik: ${errorMessage}`);
      }
    },
  });

  const handleOpenReview = (reservation: Reservation) => {
    // Check if review already exists
    if (reservation.review) {
      alert('Bu safar uchun allaqachon baholash berilgan.');
      return;
    }
    setSelectedReservation(reservation);
    setReviewModalOpen(true);
  };

  // For passengers: Get all reservations (active and past)
  // Backend now includes reviews in the response
  const { data: passengerReservationsData, isLoading: passengerReservationsLoading } = useQuery({
    queryKey: ['my-reservations', 'passenger'],
    queryFn: () => apiClient.getMyReservations(),
    enabled: isDriver === false && !!user,
  });

  // For passengers: Also get active reservation for pending status
  const { reservation: activeReservation } = useReservation();
  
  // For drivers: Get trips created by driver (active and completed)
  const { data: driverTripsData, isLoading: driverTripsLoading } = useQuery({
    queryKey: ['my-trips', 'driver'],
    queryFn: () => apiClient.getMyTripsAsDriver(),
    enabled: isDriver === true,
  });

  // Use dateUtils for consistent formatting
  const formatTimeLocal = (dateString: string) => formatTime(dateString);
  const formatDateLocal = (dateString: string) => formatDate(dateString);

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

  // Separate trips/reservations into active and past
  const activeTrips = driverTripsData?.trips?.filter((trip: Trip) => trip.status === 'ACTIVE') || [];
  const pastTrips = driverTripsData?.trips?.filter((trip: Trip) => trip.status !== 'ACTIVE') || [];

  // For passengers: Separate reservations into active and past
  const allReservations = passengerReservationsData?.reservations || [];
  const activeReservations = allReservations.filter((res: Reservation) => {
    // Active: PENDING (with activeReservation) or CONFIRMED with trip status ACTIVE
    if (res.status === 'PENDING' && activeReservation && activeReservation.id === res.id) {
      return true;
    }
    if (res.status === 'CONFIRMED' && res.trip.status === 'ACTIVE') {
      return true;
    }
    return false;
  });
  const pastReservations = allReservations.filter((res: Reservation) => {
    // Past: CANCELLED, EXPIRED, or CONFIRMED with trip status COMPLETED/CANCELLED
    if (res.status === 'CANCELLED' || res.status === 'EXPIRED') {
      return true;
    }
    if (res.status === 'CONFIRMED' && (res.trip.status === 'COMPLETED' || res.trip.status === 'CANCELLED')) {
      return true;
    }
    // Also include PENDING reservations that are not the active one
    if (res.status === 'PENDING' && (!activeReservation || activeReservation.id !== res.id)) {
      return true;
    }
    return false;
  });

  return (
    <RegistrationGuard>
      <div className="bg-gray-50 pb-20">
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
                Safarlarim
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="sticky top-[73px] z-40 bg-white pt-4 pb-2 -mt-6 mb-6 grid w-full max-w-md grid-cols-2 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                Faol ({isDriver ? activeTrips.length : activeReservations.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                Tarix ({isDriver ? pastTrips.length : pastReservations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {isDriver ? (
                // Driver: Active trips
                <>
                  {driverTripsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Yuklanmoqda...</p>
                    </div>
                  ) : activeTrips.length === 0 ? (
                    <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Faol safarlar yo'q</h3>
                          <p className="text-gray-600 text-sm">Yangi safar yaratishni boshlang</p>
                        </div>
                        <Button
                          className="bg-primary-500 hover:bg-primary-600 text-white mt-4 font-semibold py-2.5 px-6 rounded-xl"
                          onClick={() => router.push('/trips/create')}
                        >
                          Safar Yaratish
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {activeTrips.map((trip: Trip) => (
                        <Card key={trip.id} className="p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {trip.routeFrom} → {trip.routeTo}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {formatDateLocal(trip.departureWindowStart)} •{' '}
                                  {formatTimeLocal(trip.departureWindowStart)} -{' '}
                                  {formatTimeLocal(trip.departureWindowEnd)}
                                </p>
                              </div>
                              <Badge className={`${statusConfig.ACTIVE.color} border`}>
                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                {statusConfig.ACTIVE.label}
                              </Badge>
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
                                            if (chatData?.chat?.id) {
                                              router.push(`/chat/${chatData.chat.id}`);
                                            } else {
                                              throw new Error('Chat yaratilmadi');
                                            }
                                          } catch (error) {
                                            console.error('Chat yaratishda xatolik:', error);
                                            alert('Chat yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
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
                // Passenger: Active reservations
                <>
                  {passengerReservationsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Yuklanmoqda...</p>
                    </div>
                  ) : activeReservations.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      {activeReservations.map((reservation: Reservation) => {
                        const statusInfo = statusConfig[reservation.status as keyof typeof statusConfig];
                        const StatusIcon = statusInfo?.icon || Clock;
                        return (
                          <Card key={reservation.id} className="p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl">
                            <div className="space-y-4">
                              {/* Driver Info */}
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 border-2 border-gray-100">
                                  <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                                    {reservation.trip.driver.firstName?.[0] || '?'}{reservation.trip.driver.lastName?.[0] || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 text-base">
                                    {reservation.trip.driver.firstName} {reservation.trip.driver.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-500">Haydovchi</p>
                                  {reservation.trip.driver.phone && (
                                    <p className="text-sm text-gray-600 mt-1">{reservation.trip.driver.phone}</p>
                                  )}
                                </div>
                                <Badge className={`${statusInfo?.color || 'bg-gray-50 text-gray-700'} border`}>
                                  <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                  {statusInfo?.label || reservation.status}
                                </Badge>
                              </div>

                              {/* Route */}
                              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="font-semibold text-gray-900">{reservation.trip.routeFrom}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-semibold text-gray-900">{reservation.trip.routeTo}</span>
                              </div>

                              {/* Date & Time */}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {formatDateLocal(reservation.trip.departureWindowStart)} •{' '}
                            {formatTimeLocal(reservation.trip.departureWindowStart)} -{' '}
                            {formatTimeLocal(reservation.trip.departureWindowEnd)}
                          </span>
                              </div>

                              {/* Booking Info */}
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{reservation.seatCount}</span> o'rin rezervatsiya qilingan
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 pt-2">
                                {reservation.chat ? (
                                  <Button
                                    onClick={() => reservation.chat && router.push(`/chat/${reservation.chat.id}`)}
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
                                        const chatData = await apiClient.getChatByReservation(reservation.id);
                                        if (chatData?.chat?.id) {
                                          router.push(`/chat/${chatData.chat.id}`);
                                        } else {
                                          throw new Error('Chat yaratilmadi');
                                        }
                                      } catch (error) {
                                        console.error('Chat yaratishda xatolik:', error);
                                        alert('Chat yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
                                      }
                                    }}
                                    className="flex-1 border-gray-200 hover:bg-gray-50 font-semibold py-2.5 rounded-xl"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Chat yaratish
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => router.push(`/trips/${reservation.tripId}`)}
                                  className="border-gray-200 hover:bg-gray-50 font-semibold py-2.5 rounded-xl"
                                >
                                  Batafsil
                                </Button>
                                {/* Show review button for CONFIRMED reservations with COMPLETED trips */}
                                {reservation.status === 'CONFIRMED' && reservation.trip.status === 'COMPLETED' && (
                                  <Button
                                    onClick={() => handleOpenReview(reservation)}
                                    disabled={!!reservation.review}
                                    className={`font-semibold py-2.5 rounded-xl ${
                                      reservation.review
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    }`}
                                  >
                                    <Star className={`h-4 w-4 mr-2 ${reservation.review ? 'fill-gray-600' : ''}`} />
                                    {reservation.review ? 'Baholangan' : 'Baholash'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {isDriver ? (
                // Driver: Past trips
                <>
                  {pastTrips.length === 0 ? (
                    <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarix yo'q</h3>
                          <p className="text-gray-600 text-sm">Yakunlangan va bekor qilingan safarlar shu yerda ko'rinadi</p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {pastTrips.map((trip: Trip) => {
                        const statusInfo = statusConfig[trip.status as keyof typeof statusConfig];
                        const StatusIcon = statusInfo?.icon || Clock;
                        return (
                          <Card key={trip.id} className="p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {trip.routeFrom} → {trip.routeTo}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {formatDateLocal(trip.departureWindowStart)} •{' '}
                                    {formatTimeLocal(trip.departureWindowStart)} -{' '}
                                    {formatTimeLocal(trip.departureWindowEnd)}
                                  </p>
                                </div>
                                <Badge className={`${statusInfo?.color || 'bg-gray-50 text-gray-700'} border`}>
                                  <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                  {statusInfo?.label || trip.status}
                                </Badge>
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
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                // Passenger: Past reservations
                <>
                  {pastReservations.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      {pastReservations.map((reservation: Reservation) => {
                        const statusInfo = statusConfig[reservation.status as keyof typeof statusConfig];
                        const StatusIcon = statusInfo?.icon || Clock;
                        return (
                          <Card key={reservation.id} className="p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {reservation.trip.routeFrom} → {reservation.trip.routeTo}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {formatDateLocal(reservation.trip.departureWindowStart)} •{' '}
                                    {formatTimeLocal(reservation.trip.departureWindowStart)} -{' '}
                                    {formatTimeLocal(reservation.trip.departureWindowEnd)}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {reservation.trip.driver.firstName} {reservation.trip.driver.lastName}
                                  </p>
                                </div>
                                <Badge className={`${statusInfo?.color || 'bg-gray-50 text-gray-700'} border`}>
                                  <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                  {statusInfo?.label || reservation.status}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{reservation.seatCount}</span> o'rin rezervatsiya qilingan
                              </div>

                              <div className="flex gap-2">
                                {reservation.chat?.id && (
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      if (reservation.chat?.id) {
                                        router.push(`/chat/${reservation.chat.id}`);
                                      }
                                    }}
                                    className="flex-1 border-gray-200 hover:bg-gray-50 font-semibold py-2.5 rounded-xl"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Chat tarixini ko'rish
                                  </Button>
                                )}
                                {/* Show review button for CONFIRMED reservations with COMPLETED trips */}
                                {reservation.status === 'CONFIRMED' && reservation.trip.status === 'COMPLETED' && (
                                  <Button
                                    onClick={() => handleOpenReview(reservation)}
                                    disabled={!!reservation.review}
                                    className={`flex-1 font-semibold py-2.5 rounded-xl ${
                                      reservation.review
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    }`}
                                  >
                                    <Star className={`h-4 w-4 mr-2 ${reservation.review ? 'fill-gray-600' : ''}`} />
                                    {reservation.review ? 'Baholangan' : 'Baholash'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Review Modal */}
        {selectedReservation && (
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedReservation(null);
            }}
            onSubmit={(rating, reason, comment) => {
              if (selectedReservation) {
                createReviewMutation.mutate({
                  reservationId: selectedReservation.id,
                  rating,
                  reason,
                  comment,
                });
              }
            }}
            reservationId={selectedReservation.id}
            tripRoute={`${selectedReservation.trip.routeFrom} → ${selectedReservation.trip.routeTo}`}
            isLoading={createReviewMutation.isPending}
          />
        )}
      </div>
    </RegistrationGuard>
  );
}
