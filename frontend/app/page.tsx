'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteSearch } from '@/components/search/RouteSearch';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { BenefitsCarousel } from '@/components/home/BenefitsCarousel';
import { BottomNav } from '@/components/layout/BottomNav';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
    date: string;
  } | null>(null);

  const handleSearch = (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    router.push(`/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <AppHeader />
        
        {/* Rounded top corners with banner carousel */}
        <div className="bg-white rounded-t-3xl -mt-4 relative z-10">
          <BannerCarousel />
          
          {/* Search Section */}
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
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </RegistrationGuard>
  );
}
