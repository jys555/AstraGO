'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  // RegistrationGuard ensures user exists and isProfileComplete is true
  // But TypeScript doesn't know this, so we need to assert or check
  const user = data?.user;
  
  // If user is not available (shouldn't happen inside RegistrationGuard, but TypeScript needs this)
  if (!user) {
    return null; // RegistrationGuard will handle showing guest welcome
  }

  const roleLabels = {
    PASSENGER: 'Yo\'lovchi',
    DRIVER: 'Haydovchi',
    BOTH: 'Haydovchi & Yo\'lovchi',
  };

  return (
    <RegistrationGuard>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mening Profilim</h1>
          
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Profil Ma'lumotlari</h2>
                  <StatusBadge status={user.onlineStatus ? 'online' : 'offline'} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ism</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.lastName || 'Ro\'yxatdan o\'tish kerak'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-lg text-gray-900">
                      {user.username ? `@${user.username}` : 'Ko\'rsatilmagan'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefon</label>
                    <p className="text-lg text-gray-900">
                      {user.phone || 'Ko\'rsatilmagan'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Rol</label>
                    <div className="mt-1">
                      <StatusBadge 
                        status={user.role === 'DRIVER' ? 'active' : user.role === 'BOTH' ? 'online' : 'inactive'}
                        label={roleLabels[user.role]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Telegram ID</label>
                    <p className="text-sm text-gray-500 font-mono">
                      {user.telegramId}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Oxirgi faollik</label>
                    <p className="text-sm text-gray-500">
                      {new Date(user.lastSeen).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                </div>

                {user.role === 'DRIVER' || user.role === 'BOTH' ? (
                  <>
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-4">Mashina Ma'lumotlari</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mashina Raqami</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.carNumber || 'Ko\'rsatilmagan'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mashina Modeli</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.carModel || 'Ko\'rsatilmagan'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mashina Rangi</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.carColor || 'Ko\'rsatilmagan'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-4">Haydovchi Ko'rsatkichlari</h3>
                      {user.driverMetrics ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Javob Berish Darajasi</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.driverMetrics.responseRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">O'rtacha Javob Vaqti</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.driverMetrics.avgResponseTime
                                ? `${Math.round(user.driverMetrics.avgResponseTime)}s`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Jami Safarlar</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.driverMetrics.totalTrips}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Reyting</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.driverMetrics.rankingScore.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Hozircha ko'rsatkichlar mavjud emas</p>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </Card>

            <div className="mt-4">
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                Bosh Sahifaga Qaytish
              </Button>
            </div>
          </div>
        </div>
      </main>
    </RegistrationGuard>
  );
}
