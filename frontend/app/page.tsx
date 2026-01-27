'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RouteSearch } from '@/components/search/RouteSearch';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { BenefitsCarousel } from '@/components/home/BenefitsCarousel';
import { BottomNav } from '@/components/layout/BottomNav';
import { GuestHomePage } from '@/components/home/GuestHomePage';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

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

  const handleSearch = (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    router.push(`/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
  };

  const handleCreateTrip = () => {
    // Trip creation UI/functionality is not implemented yet.
    // For now, redirect drivers to trips list instead of a non-existent /trips/create page.
    router.push('/trips');
  };

  // Show guest homepage for unregistered users
  if (!user || !isProfileComplete) {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50">
          <AppHeader />
          <GuestHomePage onRegister={() => {}} />
        </div>
        <BottomNav />
      </RegistrationGuard>
    );
  }

  // Show role-based homepage for registered users
  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <AppHeader />
        
        {/* Rounded top corners with banner carousel */}
        <div className="bg-white rounded-t-3xl -mt-4 relative z-10">
          <BannerCarousel />
          
          {/* Role-based content */}
          {(userRole === 'PASSENGER' || userRole === 'BOTH') && (
            <>
              {/* Passenger Search Section */}
              <div className="px-4 py-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Safarlarni Qidiring
                  </h1>
                  <p className="text-sm text-gray-600">
                    Shaharlararo va mintaqalararo umumiy taksi xizmatlari
                  </p>
                </div>

                <RouteSearch
                  onSearch={handleSearch}
                  initialFrom={searchParams?.from}
                  initialTo={searchParams?.to}
                  initialDate={searchParams?.date}
                />
              </div>

              {/* Benefits Carousel */}
              <BenefitsCarousel />

              {/* Trip Comparison Section */}
              <div className="px-4 py-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚗</span>
                    <h3 className="font-bold text-lg text-gray-900">Safarlarni Solishtiring</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Barcha mavjud safarlarni real vaqtda o'rin bilan solishtiring va eng qulay variantni tanlang
                  </p>
                </div>
              </div>
            </>
          )}

          {(userRole === 'DRIVER' || userRole === 'BOTH') && (
            <>
              {/* Driver Section */}
              <div className="px-4 py-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {userRole === 'BOTH' ? 'Haydovchi Rejimi' : 'Haydovchi Paneli'}
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

          {userRole === 'BOTH' && (
            <div className="px-4 py-4 border-t">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Ikki Rejim</h3>
                <p className="text-sm text-gray-700">
                  Siz ham haydovchi, ham yo'lovchi sifatida ishlashingiz mumkin. Yuqorida yo'lovchi rejimi, pastda haydovchi rejimi ko'rsatilgan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </RegistrationGuard>
  );
}
