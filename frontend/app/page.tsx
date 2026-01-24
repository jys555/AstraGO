'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteSearch } from '@/components/search/RouteSearch';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

function HomePage() {
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
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Safarlarni Qidiring
              </h1>
              <p className="text-lg text-gray-600">
                Shaharlararo va mintaqalararo umumiy taksi xizmatlari
              </p>
            </div>

            <RouteSearch
              onSearch={handleSearch}
              initialFrom={searchParams?.from}
              initialTo={searchParams?.to}
              initialDate={searchParams?.date}
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="font-semibold text-lg mb-2">Safarlarni Solishtiring</h3>
                <p className="text-gray-600 text-sm">
                  Barcha mavjud safarlarni real vaqtda o'rinlar bilan ko'ring
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-semibold text-lg mb-2">Chat & Rezervatsiya</h3>
                <p className="text-gray-600 text-sm">
                  10 daqiqalik bepul rezervatsiya orqali haydovchi bilan muzokara qiling
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-semibold text-lg mb-2">Ishonchli Haydovchilar</h3>
                <p className="text-gray-600 text-sm">
                  Javob berish vaqtiga ko'ra reytinglangan haydovchilar
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RegistrationGuard>
  );
}

export default HomePage;
