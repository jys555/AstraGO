'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { STANDARD_ROUTES, VEHICLE_TYPES } from '@/lib/constants';
import { formatTime, formatDate } from '@/lib/dateUtils';
import { DateInput } from '@/components/ui/DateInput';
import { TimeInput } from '@/components/ui/TimeInput';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function CreateTripPage() {
  const router = useRouter();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const user = userData?.user;
  const isProfileComplete = !!(user?.firstName && user?.phone);
  const isDriver = user?.role === 'DRIVER';

  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  // Calculate max date: tomorrow (1 day ahead)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = tomorrow.toISOString().split('T')[0];
  const minDate = today.toISOString().split('T')[0];
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(6); // Default 6 hours
  const [vehicleType, setVehicleType] = useState(user?.carModel || VEHICLE_TYPES[0]);
  const [totalSeats, setTotalSeats] = useState(3);
  const [pickupType, setPickupType] = useState<'STATION_ONLY' | 'HOME_PICKUP'>('STATION_ONLY');
  const [deliveryType, setDeliveryType] = useState<'PASSENGER_ONLY' | 'CARGO_ACCEPTED'>('PASSENGER_ONLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRegistration, setShowRegistration] = useState(false);

  // Auto-fill vehicle type from user's car model when user data loads
  useEffect(() => {
    if (user?.carModel) {
      setVehicleType(user.carModel);
    }
  }, [user?.carModel]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!routeFrom.trim()) newErrors.routeFrom = 'Jo\'nash manzili majburiy';
    if (!routeTo.trim()) newErrors.routeTo = 'Borish manzili majburiy';
    if (!date) {
      newErrors.date = 'Sana majburiy';
    } else {
      // Validate date is not more than 1 day ahead
      const selectedDate = new Date(date);
      const maxAllowedDate = new Date(tomorrow);
      maxAllowedDate.setHours(23, 59, 59, 999);
      if (selectedDate > maxAllowedDate) {
        newErrors.date = 'Sana ertaga (1 kun) dan oshmasligi kerak';
      }
      // Validate date is not in the past
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      if (selectedDate < todayStart) {
        newErrors.date = 'Sana o\'tgan kun bo\'lishi mumkin emas';
      }
    }
    if (!startTime) newErrors.startTime = 'Boshlanish vaqti majburiy';
    if (!durationHours || durationHours < 0.5) newErrors.durationHours = 'Davomiylik kamida 0.5 soat bo\'lishi kerak';
    if (!vehicleType.trim()) newErrors.vehicleType = 'Mashina turi majburiy';
    // Driver always sets totalSeats as before (seats are for passengers only)
    if (!totalSeats || totalSeats < 1) {
      newErrors.totalSeats = 'O\'rinlar soni kamida 1 bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isProfileComplete) {
      setShowRegistration(true);
      return;
    }

    if (!isDriver) {
      router.push('/profile');
      return;
    }

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const departureWindowStart = new Date(`${date}T${startTime}:00`);
      // Calculate end time from start time + duration
      const departureWindowEnd = new Date(departureWindowStart);
      departureWindowEnd.setHours(departureWindowEnd.getHours() + Math.floor(durationHours));
      departureWindowEnd.setMinutes(departureWindowEnd.getMinutes() + Math.round((durationHours % 1) * 60));

      const { trip } = await apiClient.createTrip({
        routeFrom: routeFrom.trim(),
        routeTo: routeTo.trim(),
        departureWindowStart: departureWindowStart.toISOString(),
        departureWindowEnd: departureWindowEnd.toISOString(),
        durationHours,
        vehicleType: vehicleType.trim(),
        totalSeats,
        pickupType,
        deliveryType,
      });

      // Trip successfully created - redirect to trip detail
      router.push(`/trips/${trip.id}`);
    } catch (error: any) {
      console.error('Failed to create trip:', error);
      const message = error.message || 'Safar yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

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
                Yangi Safar Yaratish
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {!isProfileComplete && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl p-3">
              Safar yaratishdan oldin profilingizni to&apos;ldiring. Ism va telefon raqam majburiy.
            </div>
          )}

          {user && !isDriver && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4">
              <h3 className="font-semibold mb-2">Siz haydovchi emassiz</h3>
              <p className="mb-3">
                Safar yaratish uchun profilingiz roli <strong>Haydovchi</strong> bo&apos;lishi kerak. 
                Profil sozlamalarida rolni o&apos;zgartiring.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                Profilga O&apos;tish
              </Button>
            </div>
          )}

          {isProfileComplete && isDriver && (
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qayerdan</label>
                <select
                  value={routeFrom}
                  onChange={(e) => setRouteFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                >
                  <option value="">Manzilni tanlang</option>
                  {STANDARD_ROUTES.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
                {errors.routeFrom && <p className="text-xs text-red-500 mt-1">{errors.routeFrom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qayerga</label>
                <select
                  value={routeTo}
                  onChange={(e) => setRouteTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                >
                  <option value="">Manzilni tanlang</option>
                  {STANDARD_ROUTES.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
                {errors.routeTo && <p className="text-xs text-red-500 mt-1">{errors.routeTo}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sana</label>
                  <DateInput
                    value={date}
                    onChange={setDate}
                    min={minDate}
                    max={maxDate}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                    required
                    placeholder="DD/MM/YYYY"
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boshlanish vaqti</label>
                  <TimeInput
                    value={startTime}
                    onChange={setStartTime}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                    required
                    placeholder="HH:mm"
                  />
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taxminiy davomiyligi (soat)</label>
                  <input
                    type="number"
                    min={0.5}
                    max={24}
                    step={0.5}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                    placeholder="Masalan: 6"
                  />
                  {errors.durationHours && <p className="text-xs text-red-500 mt-1">{errors.durationHours}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">O&apos;rinlar soni</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                  />
                  {errors.totalSeats && <p className="text-xs text-red-500 mt-1">{errors.totalSeats}</p>}
                </div>
              </div>
              {date && startTime && durationHours > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Taxminiy tugash vaqti: {
                    (() => {
                      const start = new Date(`${date}T${startTime}:00`);
                      const end = new Date(start);
                      end.setHours(end.getHours() + Math.floor(durationHours));
                      end.setMinutes(end.getMinutes() + Math.round((durationHours % 1) * 60));
                      return formatTime(end);
                    })()
                  }
                  {(() => {
                    const start = new Date(`${date}T${startTime}:00`);
                    const end = new Date(start);
                    end.setHours(end.getHours() + Math.floor(durationHours));
                    end.setMinutes(end.getMinutes() + Math.round((durationHours % 1) * 60));
                    const isNextDay = end.toDateString() !== start.toDateString();
                    return isNextDay ? ` (${formatDate(end)})` : '';
                  })()}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mashina turi / modeli</label>
                <input
                  type="text"
                  value={vehicleType}
                  readOnly
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                  title="Mashina modeli profilingizdan olinadi"
                />
                <p className="text-xs text-gray-500 mt-1">Mashina modeli profilingizdan avtomatik olinadi</p>
                {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Olish joyi</label>
                  <select
                    value={pickupType}
                    onChange={(e) => setPickupType(e.target.value as 'STATION_ONLY' | 'HOME_PICKUP')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                  >
                    <option value="STATION_ONLY">Fakat bekatdan</option>
                    <option value="HOME_PICKUP">Uy manzilidan ham</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yo&apos;lovchi / Yuk</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as 'PASSENGER_ONLY' | 'CARGO_ACCEPTED')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 transition-all"
                  >
                    <option value="PASSENGER_ONLY">Faqat yo&apos;lovchi</option>
                    <option value="CARGO_ACCEPTED">Yo&apos;lovchi + Yuk</option>
                  </select>
                </div>
              </div>

              {errors.submit && (
                <p className="text-xs text-red-500 mt-2">{errors.submit}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-base font-semibold rounded-xl mt-4"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Safarni yaratish
              </Button>
            </form>
          </Card>
          )}
        </main>

        <RegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false);
            window.location.reload();
          }}
        />
      </div>
    </RegistrationGuard>
  );
}

