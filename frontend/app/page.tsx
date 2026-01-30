'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RouteSearch } from '@/components/search/RouteSearch';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { BenefitsCarousel } from '@/components/home/BenefitsCarousel';
import { GuestHomePage } from '@/components/home/GuestHomePage';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
    date: string;
  } | null>(null);

  // Get user data to determine role
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const user = userData?.user;
  const userRole = user?.role || 'PASSENGER';
  const isProfileComplete = !!(user?.firstName && user?.phone);

  const handleSearch = (from: string, to: string, date: string, passengerCount?: number) => {
    // Update state with required fields only
    setSearchParams({ from, to, date });
    
    // Build URL with all params including passengerCount
    const urlParams = new URLSearchParams({
      from,
      to,
      date,
      ...(passengerCount && passengerCount > 1 ? { passengerCount: passengerCount.toString() } : {}),
    });
    router.push(`/trips?${urlParams.toString()}`);
  };

  const handleCreateTrip = () => {
    router.push('/trips/create');
  };

  // Show unified homepage - guest mode or role-based for registered users
  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <AppHeader />
        
        {/* Rounded top corners with banner carousel */}
        <div className="bg-white rounded-t-3xl -mt-4 relative z-10">
          <BannerCarousel />
          
          {/* Guest mode - show general info and presentation */}
          {(!user || !isProfileComplete) ? (
            <div className="px-4 py-6 space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  AstraGo - Qulay Safar
                </h1>
                <p className="text-sm text-gray-600">
                  Xavfsiz va qulay safar uchun eng yaxshi yechim
                </p>
              </div>

              <RouteSearch
                onSearch={handleSearch}
                initialFrom={searchParams?.from}
                initialTo={searchParams?.to}
                initialDate={searchParams?.date}
              />

              {/* Benefits Carousel */}
              <BenefitsCarousel />

              {/* Quick Filters */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Tezkor Filtrlar</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                    ✓ Onlayn haydovchilar
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                    ⏰ Eng tezkor jo'nash
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                    🏠 Uydan olish
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                    📦 Yuk qabul qiladi
                  </button>
                </div>
              </div>

              {/* Driver Section for Guests */}
              <div className="bg-gradient-to-b from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Siz haydovchisiz va yo'lovchilar sizni topishini xohlaysizmi?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Safaringizni yarating va yo'lovchilarni toping. Qulay narxlar va tez to'lovlar
                  </p>
                </div>

                <Button
                  onClick={handleCreateTrip}
                  variant="primary"
                  className="w-full"
                >
                  🚗 Safar Yaratish
                </Button>
              </div>
            </div>
          ) : (
            /* Registered user - role-based content */
            <>
              {userRole === 'PASSENGER' && (
                <>
                  {/* Passenger Search Section */}
                  <div className="px-4 py-6 space-y-6">
                    <RouteSearch
                      onSearch={handleSearch}
                      initialFrom={searchParams?.from}
                      initialTo={searchParams?.to}
                      initialDate={searchParams?.date}
                    />

                    {/* Quick Filters */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Tezkor Filtrlar</h3>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          ✓ Onlayn haydovchilar
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          ⏰ Eng tezkor jo'nash
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          🏠 Uydan olish
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          📦 Yuk qabul qiladi
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {userRole === 'DRIVER' && (
                <>
                  {/* Driver Section */}
                  <div className="px-4 py-6">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Haydovchi Paneli
                      </h1>
                      <p className="text-sm text-gray-600">
                        Safar yaratish va boshqarish
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleCreateTrip}
                        variant="primary"
                        className="w-full"
                      >
                        🚗 Yangi Safar Yaratish
                      </Button>

                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Yo'nalishlar va Tushunchalar</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• Safar yaratish: Yo'nalish, vaqt va narxni belgilang</li>
                          <li>• Rezervatsiyalar: Yo'lovchilarning rezervatsiyalarini ko'ring va tasdiqlang</li>
                          <li>• Chat: Yo'lovchilar bilan to'g'ridan-to'g'ri aloqa</li>
                          <li>• Reyting: Javob berish darajasi va o'rtacha javob vaqti</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </RegistrationGuard>
  );
}
