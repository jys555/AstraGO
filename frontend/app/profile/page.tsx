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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Profile Overview */}
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-gray-100">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.lastName || 'Foydalanuvchi'}
                </h2>
                {memberSince && (
                  <p className="text-gray-600 mt-1">A'zo bo'lgan: {memberSince}</p>
                )}
                
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                  {user?.driverMetrics && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {user.driverMetrics.rankingScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <Badge className="bg-green-50 text-green-700 border-green-200 border">
                    Tasdiqlangan
                  </Badge>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => setShowEditModal(true)}
              >
                Profilni Tahrirlash
              </Button>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 border border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aloqa Ma'lumotlari</h3>
            <div className="space-y-4">
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}
              {user?.username && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium text-gray-900">@{user.username}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Trip Statistics */}
          {user?.driverMetrics && (
            <Card className="p-6 border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safar Statistikalari</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{user.driverMetrics.totalTrips}</div>
                  <div className="text-sm text-gray-600 mt-1">Jami Safarlar</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{user.driverMetrics.responseRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600 mt-1">Javob Berish</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">
                    {user.driverMetrics.avgResponseTime ? Math.round(user.driverMetrics.avgResponseTime) : 0}s
                  </div>
                  <div className="text-sm text-gray-600 mt-1">O'rtacha Vaqt</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">{user.driverMetrics.rankingScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1">Reyting</div>
                </div>
              </div>
            </Card>
          )}

          {/* Car Information (for drivers) */}
          {user?.role === 'DRIVER' && (user?.carNumber || user?.carModel || user?.carColor) && (
            <Card className="p-6 border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mashina Ma'lumotlari</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {user?.carNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Mashina Raqami</p>
                    <p className="font-medium text-gray-900">{user.carNumber}</p>
                  </div>
                )}
                {user?.carModel && (
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium text-gray-900">{user.carModel}</p>
                  </div>
                )}
                {user?.carColor && (
                  <div>
                    <p className="text-sm text-gray-500">Rang</p>
                    <p className="font-medium text-gray-900">{user.carColor}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Settings */}
          <Card className="p-6 border border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sozlamalar</h3>
            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bildirishnomalar</p>
                    <p className="text-sm text-gray-500">Safar yangilanishlarini olish</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              {/* Privacy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Maxfiylik va Xavfsizlik</p>
                    <p className="text-sm text-gray-500">Maxfiylikni boshqarish</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Help & Support */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Yordam va Qo'llab-quvvatlash</p>
                    <p className="text-sm text-gray-500">AstraGo haqida yordam olish</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <Card className="p-6 border border-red-200 bg-white">
            <Button 
              variant="outline" 
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
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
