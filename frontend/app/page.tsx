'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouteSearch } from '@/components/search/RouteSearch';

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
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Shared Taxi
            </h1>
            <p className="text-lg text-gray-600">
              Search for intercity and interregional shared taxi services
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
              <h3 className="font-semibold text-lg mb-2">Compare Trips</h3>
              <p className="text-gray-600 text-sm">
                View all available trips with real-time seat availability
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold text-lg mb-2">Chat & Reserve</h3>
              <p className="text-gray-600 text-sm">
                10-minute soft reservation to negotiate with drivers
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-semibold text-lg mb-2">Reliable Drivers</h3>
              <p className="text-gray-600 text-sm">
                Drivers ranked by response time and reliability
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
