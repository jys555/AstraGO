'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Mail, Phone, Star, Calendar, Settings, Bell, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { EditProfileModal } from '@/components/auth/EditProfileModal';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const user = data?.user;

  const roleLabels = {
    PASSENGER: 'Yo\'lovchi',
    DRIVER: 'Haydovchi',
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
    : '';

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
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
              <h1 className="text-xl font-bold text-gray-900">Profil</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Profile Overview */}
          <Card className="p-6 border border-gray-100 bg-white rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-20 w-20 border-3 border-gray-100">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xl font-semibold">
                  {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.lastName || 'Foydalanuvchi'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{roleLabels[user?.role || 'PASSENGER']}</p>
                {memberSince && (
                  <p className="text-xs text-gray-500 mt-1">A'zo bo'lgan: {memberSince}</p>
                )}
                
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                  {user?.driverMetrics && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 text-sm">
                        {user.driverMetrics.rankingScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <Badge className="bg-secondary-50 text-secondary-700 border-secondary-200 border text-xs">
                    Tasdiqlangan
                  </Badge>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="border-gray-200 hover:bg-gray-50 font-semibold rounded-xl"
                onClick={() => setShowEditModal(true)}
              >
                Tahrirlash
              </Button>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-5 border border-gray-100 bg-white rounded-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Aloqa Ma'lumotlari</h3>
            <div className="space-y-3">
              {user?.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="h-9 w-9 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900 text-sm">{user.phone}</p>
                  </div>
                </div>
              )}
              {user?.username && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="font-medium text-gray-900 text-sm">@{user.username}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Trip Statistics */}
          {user?.driverMetrics && (
            <Card className="p-5 border border-gray-100 bg-white rounded-2xl">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Safar Statistikalari</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-bold text-primary-600">{user.driverMetrics.totalTrips}</div>
                  <div className="text-xs text-gray-600 mt-1">Jami Safarlar</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-xl">
                  <div className="text-2xl font-bold text-secondary-600">{user.driverMetrics.responseRate.toFixed(0)}%</div>
                  <div className="text-xs text-gray-600 mt-1">Javob Berish</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-700">
                    {user.driverMetrics.avgResponseTime ? Math.round(user.driverMetrics.avgResponseTime) : 0}s
                  </div>
                  <div className="text-xs text-gray-600 mt-1">O'rtacha Vaqt</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">{user.driverMetrics.rankingScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-600 mt-1">Reyting</div>
                </div>
              </div>
            </Card>
          )}

          {/* Car Information (for drivers) */}
          {user?.role === 'DRIVER' && (user?.carNumber || user?.carModel || user?.carColor) && (
            <Card className="p-5 border border-gray-100 bg-white rounded-2xl">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Mashina Ma'lumotlari</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {user?.carNumber && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Mashina Raqami</p>
                    <p className="font-medium text-gray-900 text-sm">{user.carNumber}</p>
                  </div>
                )}
                {user?.carModel && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Model</p>
                    <p className="font-medium text-gray-900 text-sm">{user.carModel}</p>
                  </div>
                )}
                {user?.carColor && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Rang</p>
                    <p className="font-medium text-gray-900 text-sm">{user.carColor}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Settings */}
          <Card className="p-5 border border-gray-100 bg-white rounded-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Sozlamalar</h3>
            <div className="space-y-3">
              {/* Notifications */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Bildirishnomalar</p>
                    <p className="text-xs text-gray-500">Safar yangilanishlarini olish</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              {/* Privacy */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Maxfiylik va Xavfsizlik</p>
                    <p className="text-xs text-gray-500">Maxfiylikni boshqarish</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Help & Support */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Yordam va Qo'llab-quvvatlash</p>
                    <p className="text-xs text-gray-500">AstraGo haqida yordam olish</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <Card className="p-5 border border-gray-100 bg-white rounded-2xl">
            <Button 
              variant="outline" 
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl"
              onClick={() => router.push('/')}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Chiqish
            </Button>
          </Card>
        </main>
        
        {user && (
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
              setShowEditModal(false);
            }}
            user={user}
          />
        )}
      </div>
    </RegistrationGuard>
  );
}
