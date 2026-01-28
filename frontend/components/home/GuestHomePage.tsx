'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Filter, Zap, Clock, Package } from 'lucide-react';
import { RouteSearch } from '@/components/search/RouteSearch';
import { BannerCarousel } from './BannerCarousel';
import { BenefitsCarousel } from './BenefitsCarousel';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { id: 'online', label: 'Online haydovchilar', icon: Zap },
    { id: 'earliest', label: 'Eng erta jo\'nashlar', icon: Clock },
    { id: 'cargo', label: 'Yuk qabul qiladi', icon: Package },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

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
      sessionStorage.removeItem('pendingCreateTrip');
      router.push('/trips/create');
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white pb-20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Banner Carousel */}
          <div className="mb-8">
            <BannerCarousel />
          </div>

          {/* Search Section */}
          <Card className="p-6 sm:p-8 shadow-lg border-0 bg-white mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Safaringizni Toping</h2>
            
            <div className="space-y-4">
              {/* From/To Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Qayerdan"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Qayerga"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Field */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  placeholder="Sana"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={() => {
                  if (from && to) {
                    handleSearch(from, to, date);
                  }
                }}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
              >
                <Search className="h-5 w-5 mr-2" />
                Safarlarni Qidirish
              </Button>
            </div>
          </Card>

          {/* Quick Filters */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tezkor Filtrlar</h3>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                <Filter className="h-4 w-4 mr-1" />
                Ko'proq
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilters.includes(filter.id);
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                      ${isActive 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${isActive ? 'bg-blue-500' : 'bg-gray-100'}
                    `}>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {filter.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mashhur Yo'nalishlar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { from: 'Toshkent', to: 'Samarqand', trips: 24 },
                { from: 'Toshkent', to: 'Buxoro', trips: 18 },
                { from: 'Toshkent', to: 'Andijon', trips: 15 },
              ].map((route, index) => (
                <Card
                  key={index}
                  className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100"
                  onClick={() => {
                    setFrom(route.from);
                    setTo(route.to);
                    handleSearch(route.from, route.to, '');
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{route.from}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{route.to}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {route.trips} ta safar mavjud
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Driver Section */}
          <div className="px-4 py-6 bg-gradient-to-b from-blue-50 to-white rounded-xl">
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
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
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
        </main>
      </div>

      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
}
