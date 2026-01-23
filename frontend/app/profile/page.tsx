'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load profile</p>
                <Button onClick={() => router.push('/')} variant="outline">
                  Go Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const user = data?.user;

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Not authenticated</p>
                <Button onClick={() => router.push('/')} variant="outline">
                  Go Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const roleLabels = {
    PASSENGER: 'Passenger',
    DRIVER: 'Driver',
    BOTH: 'Driver & Passenger',
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <StatusBadge status={user.onlineStatus ? 'online' : 'offline'} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-lg text-gray-900">
                    {user.username ? `@${user.username}` : 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg text-gray-900">
                    {user.phone || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
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
                  <label className="text-sm font-medium text-gray-600">Last Seen</label>
                  <p className="text-sm text-gray-500">
                    {new Date(user.lastSeen).toLocaleString()}
                  </p>
                </div>
              </div>

              {user.role === 'DRIVER' || user.role === 'BOTH' ? (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Driver Metrics</h3>
                  {user.driverMetrics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Response Rate</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.driverMetrics.responseRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Avg Response Time</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.driverMetrics.avgResponseTime
                            ? `${Math.round(user.driverMetrics.avgResponseTime)}s`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Total Trips</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.driverMetrics.totalTrips}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ranking Score</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.driverMetrics.rankingScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No metrics available yet</p>
                  )}
                </div>
              ) : null}
            </div>
          </Card>

          <div className="mt-4">
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
