'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STANDARD_ROUTES, VEHICLE_TYPES } from '@/lib/constants';

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
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [vehicleType, setVehicleType] = useState(user?.carModel || VEHICLE_TYPES[0]);
  const [totalSeats, setTotalSeats] = useState(3);
  const [pickupType, setPickupType] = useState<'STATION_ONLY' | 'HOME_PICKUP'>('STATION_ONLY');
  const [deliveryType, setDeliveryType] = useState<'PASSENGER_ONLY' | 'CARGO_ACCEPTED'>('PASSENGER_ONLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRegistration, setShowRegistration] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!routeFrom.trim()) newErrors.routeFrom = 'Jo\'nash manzili majburiy';
    if (!routeTo.trim()) newErrors.routeTo = 'Borish manzili majburiy';
    if (!date) newErrors.date = 'Sana majburiy';
    if (!startTime) newErrors.startTime = 'Boshlanish vaqti majburiy';
    if (!endTime) newErrors.endTime = 'Tugash vaqti majburiy';
    if (!vehicleType.trim()) newErrors.vehicleType = 'Mashina turi majburiy';
    if (!totalSeats || totalSeats < 1) newErrors.totalSeats = 'O\'rinlar soni kamida 1 bo\'lishi kerak';

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

      const departureWindowStart = new Date(`${date}T${startTime}:00`).toISOString();
      const departureWindowEnd = new Date(`${date}T${endTime}:00`).toISOString();

      const { trip } = await apiClient.createTrip({
        routeFrom: routeFrom.trim(),
        routeTo: routeTo.trim(),
        departureWindowStart,
        departureWindowEnd,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <AppHeader />

        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Yangi Safar Yaratish</h1>

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
            <Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qayerdan</label>
                <select
                  value={routeFrom}
                  onChange={(e) => setRouteFrom(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Qayerga</label>
                <select
                  value={routeTo}
                  onChange={(e) => setRouteTo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish vaqti</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tugash vaqti</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mashina turi / modeli</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O&apos;rinlar soni</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                {errors.totalSeats && <p className="text-xs text-red-500 mt-1">{errors.totalSeats}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Olish joyi</label>
                  <select
                    value={pickupType}
                    onChange={(e) => setPickupType(e.target.value as 'STATION_ONLY' | 'HOME_PICKUP')}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STATION_ONLY">Fakat bekatdan</option>
                    <option value="HOME_PICKUP">Uy manzilidan ham</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yo&apos;lovchi / Yuk</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as 'PASSENGER_ONLY' | 'CARGO_ACCEPTED')}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full mt-2"
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

