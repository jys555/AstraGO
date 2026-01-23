import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Trip } from '@/types';
import { motion } from 'framer-motion';

interface TripCardProps {
  trip: Trip;
  onReserve: (tripId: string) => void;
  isLoading?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onReserve, isLoading }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const departureStart = formatTime(trip.departureWindowStart);
  const departureEnd = formatTime(trip.departureWindowEnd);
  const date = formatDate(trip.departureWindowStart);

  const getVehicleIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('sedan')) return '🚗';
    if (lower.includes('suv')) return '🚙';
    if (lower.includes('van')) return '🚐';
    if (lower.includes('bus')) return '🚌';
    return '🚕';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4" hover>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getVehicleIcon(trip.vehicleType)}</span>
              <div>
                <h3 className="font-semibold text-lg">{trip.vehicleType}</h3>
                <p className="text-sm text-gray-600">{trip.driver.firstName} {trip.driver.lastName}</p>
              </div>
            </div>
            <StatusBadge status={trip.driver.onlineStatus ? 'online' : 'offline'} />
          </div>

          {/* Route */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-primary-600 font-semibold">{trip.routeFrom}</span>
                <span className="text-gray-400">→</span>
                <span className="text-primary-600 font-semibold">{trip.routeTo}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Departure</p>
              <p className="font-semibold">{departureStart} - {departureEnd}</p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
            <div>
              <p className="text-gray-600">Available Seats</p>
              <p className="font-semibold text-primary-600">{trip.availableSeats} / {trip.totalSeats}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {trip.pickupType === 'HOME_PICKUP' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Home Pickup</span>
            )}
            {trip.deliveryType === 'CARGO_ACCEPTED' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Cargo Accepted</span>
            )}
            {trip.driver.driverMetrics && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ⭐ {trip.driver.driverMetrics.rankingScore.toFixed(1)}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={() => onReserve(trip.id)}
            disabled={trip.availableSeats === 0 || isLoading}
            isLoading={isLoading}
          >
            {trip.availableSeats === 0 ? 'No Seats Available' : 'Chat & Reserve (10 min)'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
