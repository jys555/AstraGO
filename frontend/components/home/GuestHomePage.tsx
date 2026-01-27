'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteSearch } from '@/components/search/RouteSearch';
import { BannerCarousel } from './BannerCarousel';
import { BenefitsCarousel } from './BenefitsCarousel';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { Button } from '@/components/ui/Button';

interface GuestHomePageProps {
  onRegister: () => void;
}

export function GuestHomePage({ onRegister }: GuestHomePageProps) {
  const router = useRouter();
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationContext, setRegistrationContext] = useState<'passenger' | 'driver' | null>(null);
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
    date: string;
  } | null>(null);

  const handleSearch = (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    // Store search params for after registration
    sessionStorage.setItem('pendingSearch', JSON.stringify({ from, to, date }));
    // Open registration modal
    setRegistrationContext('passenger');
    setShowRegistration(true);
  };

  const handleCreateTrip = () => {
    // Store create trip intent for after registration
    sessionStorage.setItem('pendingCreateTrip', 'true');
    // Open registration modal
    setRegistrationContext('driver');
    setShowRegistration(true);
  };

  const handleRegistrationSuccess = () => {
    // After registration, continue from where user left off
    const pendingSearch = sessionStorage.getItem('pendingSearch');
    const pendingCreateTrip = sessionStorage.getItem('pendingCreateTrip');
    
    if (pendingSearch) {
      const { from, to, date } = JSON.parse(pendingSearch);
      sessionStorage.removeItem('pendingSearch');
      router.push(`/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
    } else if (pendingCreateTrip) {
      // Trip creation UI/functionality is not implemented yet.
      // After registration, redirect driver to trips list instead of a non-existent /trips/create page.
      sessionStorage.removeItem('pendingCreateTrip');
      router.push('/trips');
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Banner Carousel */}
        <div className="bg-white rounded-b-3xl">
          <BannerCarousel />
        </div>

        {/* AstraGO Benefits Section */}
        <div className="px-4 py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AstraGO - Qulay va Xavfsiz Safar
            </h2>
            <p className="text-sm text-gray-600">
              Shaharlararo va mintaqalararo umumiy taksi xizmatlari
            </p>
          </div>

          <BenefitsCarousel />
        </div>

        {/* Passenger Section */}
        <div className="px-4 py-6 bg-white border-t">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Siz yo'lovchisiz va sizga mos reys qidirayapsizmi?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Qulay va xavfsiz safar uchun barcha mavjud safarlarni ko'ring va eng qulay variantni tanlang
            </p>
          </div>

          <RouteSearch
            onSearch={handleSearch}
            initialFrom={searchParams?.from}
            initialTo={searchParams?.to}
            initialDate={searchParams?.date}
          />
        </div>

        {/* Driver Section */}
        <div className="px-4 py-6 bg-gradient-to-b from-blue-50 to-white">
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

          <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Haydovchilar uchun afzalliklar:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ O'zingiz belgilagan narxlar</li>
              <li>✓ Tez va xavfsiz to'lovlar</li>
              <li>✓ Reyting tizimi</li>
              <li>✓ Real vaqtda chat</li>
            </ul>
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
}
