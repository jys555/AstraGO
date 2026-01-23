import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { TripFilters } from '@/types';
import { wsClient } from '@/lib/websocket';
import { useEffect } from 'react';

export function useTrips(filters?: TripFilters) {
  const query = useQuery({
    queryKey: ['trips', filters],
    queryFn: () => apiClient.getTrips(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to trip updates via WebSocket
  useEffect(() => {
    if (!query.data?.trips) return;

    const tripIds = query.data.trips.map((trip) => trip.id);
    
    tripIds.forEach((tripId) => {
      wsClient.subscribeToTrip(tripId, () => {
        query.refetch();
      });
    });

    return () => {
      tripIds.forEach((tripId) => {
        wsClient.unsubscribeFromTrip(tripId);
      });
    };
  }, [query.data, query.refetch]);

  return query;
}
