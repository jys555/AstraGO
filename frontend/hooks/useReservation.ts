import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Reservation } from '@/types';
import { wsClient } from '@/lib/websocket';

const RESERVATION_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DRIVER_RESPONSE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function useReservation() {
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [driverResponded, setDriverResponded] = useState(false);

  // Get active reservation
  const { data: activeReservationData, refetch: refetchActive } = useQuery({
    queryKey: ['reservation', 'active'],
    queryFn: () => apiClient.getActiveReservation(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const reservation = activeReservationData?.reservation || null;
  const initialDriverResponded = activeReservationData?.driverResponded || false;

  // Calculate time remaining
  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') {
      setTimeRemaining(null);
      return;
    }

    const expiresAt = new Date(reservation.expiresAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeRemaining(remaining);

      if (remaining === 0 && reservation.status === 'PENDING') {
        // Reservation expired
        refetchActive();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservation, refetchActive]);

  // Check driver response
  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') {
      setDriverResponded(false);
      return;
    }

    const reservedAt = new Date(reservation.reservedAt).getTime();
    const now = Date.now();
    const timeSinceReservation = now - reservedAt;

    // Driver is considered responsive if:
    // 1. Driver is online
    // 2. Less than 2 minutes have passed since reservation
    const driverIsOnline = reservation.trip.driver.onlineStatus;
    const withinResponseWindow = timeSinceReservation < DRIVER_RESPONSE_TIMEOUT_MS;

    setDriverResponded(driverIsOnline && withinResponseWindow);
  }, [reservation]);

  // Subscribe to reservation updates via WebSocket
  useEffect(() => {
    if (!reservation) return;

    const handleUpdate = (data: any) => {
      refetchActive();
    };

    wsClient.subscribeToReservation(reservation.id, handleUpdate);

    return () => {
      wsClient.unsubscribeFromReservation(reservation.id);
    };
  }, [reservation, refetchActive]);

  // Create reservation mutation
  const createMutation = useMutation({
    mutationFn: ({ tripId, seatCount }: { tripId: string; seatCount?: number }) =>
      apiClient.createReservation(tripId, seatCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  // Confirm reservation mutation
  const confirmMutation = useMutation({
    mutationFn: (reservationId: string) => apiClient.confirmReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => apiClient.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const createReservation = useCallback(
    (tripId: string, seatCount: number = 1) => {
      return createMutation.mutateAsync({ tripId, seatCount });
    },
    [createMutation]
  );

  const confirmReservation = useCallback(
    (reservationId: string) => {
      return confirmMutation.mutateAsync(reservationId);
    },
    [confirmMutation]
  );

  const cancelReservation = useCallback(
    (reservationId: string) => {
      return cancelMutation.mutateAsync(reservationId);
    },
    [cancelMutation]
  );

  return {
    reservation,
    timeRemaining,
    driverResponded: driverResponded || initialDriverResponded,
    createReservation,
    confirmReservation,
    cancelReservation,
    isLoading: createMutation.isPending || confirmMutation.isPending || cancelMutation.isPending,
  };
}
