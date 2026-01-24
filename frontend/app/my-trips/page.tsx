'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { openTelegramChat } from '@/lib/telegram';
import { useReservation } from '@/hooks/useReservation';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function MyTripsPage() {
  const router = useRouter();
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  // Get active reservation
  const { reservation: activeReservation } = useReservation();

  // In a real app, you'd fetch all user's reservations (active, confirmed, completed, etc.)
  // For now, we'll show the active reservation if it exists
  const reservations: any[] = activeReservation ? [activeReservation] : [];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <StatusBadge status="confirmed" />;
      case 'PENDING':
        return <StatusBadge status="pending" />;
      case 'EXPIRED':
        return <StatusBadge status="expired" />;
      case 'CANCELLED':
        return <StatusBadge status="expired" label="Cancelled" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Trips</h1>

        {reservations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No trips yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Start by searching for a trip and making a reservation
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/')}
              >
                Search for Trips
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {reservation.trip.routeFrom} → {reservation.trip.routeTo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(reservation.trip.departureWindowStart)} •{' '}
                        {formatTime(reservation.trip.departureWindowStart)} -{' '}
                        {formatTime(reservation.trip.departureWindowEnd)}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Driver</p>
                      <p className="font-semibold">
                        {reservation.trip.driver.firstName}{' '}
                        {reservation.trip.driver.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Seats</p>
                      <p className="font-semibold">{reservation.seatCount}</p>
                    </div>
                  </div>

                  {reservation.chat && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openTelegramChat(
                            reservation.trip.driver.username,
                            reservation.trip.driver.phone
                          )
                        }
                      >
                        Open Chat
                      </Button>
                      {reservation.status === 'CONFIRMED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            router.push(`/trips/${reservation.tripId}`)
                          }
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  )}

                  {reservation.status === 'PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Reservation is pending. Complete the negotiation to confirm.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </main>
    );
}
