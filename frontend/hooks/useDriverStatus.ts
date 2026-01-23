import { useState, useEffect } from 'react';
import { Reservation } from '@/types';

const DRIVER_RESPONSE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function useDriverStatus(reservation: Reservation | null) {
  const [isActive, setIsActive] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') {
      setIsActive(false);
      setIsInactive(false);
      return;
    }

    const driver = reservation.trip.driver;
    const reservedAt = new Date(reservation.reservedAt).getTime();
    const now = Date.now();
    const timeSinceReservation = now - reservedAt;

    const driverIsOnline = driver.onlineStatus;
    const withinResponseWindow = timeSinceReservation < DRIVER_RESPONSE_TIMEOUT_MS;

    setIsActive(driverIsOnline && withinResponseWindow);
    setIsInactive(!driverIsOnline || timeSinceReservation >= DRIVER_RESPONSE_TIMEOUT_MS);
  }, [reservation]);

  return { isActive, isInactive };
}
