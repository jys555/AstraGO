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
        <h2 className="text-xl font-bold text-gray-900">Rezervatsiya Faol</h2>
        <StatusBadge
          status={driverResponded ? 'active' : 'inactive'}
          label={driverResponded ? 'Haydovchi Faol' : 'Haydovchi Faol Emas'}
        />
      </div>

      {/* Timer */}
      <Timer timeRemaining={timeRemaining} />

      {/* Trip Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Yo'nalish</span>
          <span className="font-semibold text-gray-900">
            {reservation.trip.routeFrom} → {reservation.trip.routeTo}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">O'rinlar</span>
          <span className="font-semibold text-gray-900">{reservation.seatCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Haydovchi</span>
          <span className="font-semibold text-gray-900">
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
          Telegram Chatga O'tish
        </Button>

        {driverResponded ? (
          <Button
            variant="primary"
            className="w-full"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Rezervatsiyani Tasdiqlash
          </Button>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Haydovchi hali javob bermadi. Bekor qilish va boshqa safarni tanlash mumkin.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
          disabled={isLoading}
        >
          Rezervatsiyani Bekor Qilish
        </Button>
      </div>

      {!driverResponded && (
        <p className="text-xs text-gray-500 text-center">
          Agar haydovchi 2 daqiqa ichida javob bermasa, bekor qilish va boshqa safarni tanlash mumkin.
        </p>
      )}
    </motion.div>
  );
};
