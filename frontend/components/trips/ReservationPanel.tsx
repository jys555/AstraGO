import React from 'react';
import { Timer } from '../ui/Timer';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Reservation } from '@/types';
import { openTelegramChat } from '@/lib/telegram';
import { motion } from 'framer-motion';

interface ReservationPanelProps {
  reservation: Reservation;
  timeRemaining: number;
  driverResponded: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReservationPanel: React.FC<ReservationPanelProps> = ({
  reservation,
  timeRemaining,
  driverResponded,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const handleOpenChat = () => {
    const driver = reservation.trip.driver;
    openTelegramChat(driver.username || undefined, driver.phone || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reservation Active</h2>
        <StatusBadge
          status={driverResponded ? 'active' : 'inactive'}
          label={driverResponded ? 'Driver Active' : 'Driver Inactive'}
        />
      </div>

      {/* Timer */}
      <Timer timeRemaining={timeRemaining} />

      {/* Trip Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Route</span>
          <span className="font-semibold">
            {reservation.trip.routeFrom} → {reservation.trip.routeTo}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Seats</span>
          <span className="font-semibold">{reservation.seatCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Driver</span>
          <span className="font-semibold">
            {reservation.trip.driver.firstName} {reservation.trip.driver.lastName}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleOpenChat}
        >
          Open Telegram Chat
        </Button>

        {driverResponded ? (
          <Button
            variant="primary"
            className="w-full"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm Reservation
          </Button>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Driver hasn't responded yet. You can cancel and choose another trip.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel Reservation
        </Button>
      </div>

      {!driverResponded && (
        <p className="text-xs text-gray-500 text-center">
          If driver doesn't respond within 2 minutes, you can cancel and select another trip.
        </p>
      )}
    </motion.div>
  );
};
