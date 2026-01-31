import React from 'react';
import { Car, Users, Home, Package, Star, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trip } from '@/types';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

interface TripCardProps {
  trip: Trip;
  onReserve: (tripId: string) => void;
  isLoading?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onReserve, isLoading }) => {
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const currentUser = userData?.user;
  // Check if current user is the driver of this trip
  const isOwnTrip = currentUser?.id && trip.driver?.id && currentUser.id === trip.driver.id;
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
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

  const vehicleIcons = {
    sedan: Car,
    suv: Car,
    van: Car,
    bus: Car,
  };

  const VehicleIcon = vehicleIcons[trip.vehicleType.toLowerCase() as keyof typeof vehicleIcons] || Car;

  const isDriverOnline = trip.driver?.onlineStatus ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5 hover:shadow-md transition-all duration-200 border border-gray-100 bg-white mb-3 rounded-2xl">
        <div className="space-y-4">
          {/* Header: Vehicle Type & Driver Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getVehicleIcon(trip.vehicleType)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {trip.driver.firstName} {trip.driver.lastName}
                  </h3>
                  {isDriverOnline ? (
                    <span className="h-2 w-2 bg-secondary-500 rounded-full" title="Onlayn" />
                  ) : (
                    <span className="h-2 w-2 bg-gray-300 rounded-full" title="Oflayn" />
                  )}
                </div>
                {trip.driver.driverMetrics && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {trip.driver.driverMetrics.rankingScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Bo'sh o'rinlar</div>
              <div className="text-lg font-bold text-gray-900">{trip.availableSeats}</div>
            </div>
          </div>

          {/* Route */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-base">{trip.routeFrom}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900 text-base">{trip.routeTo}</span>
            </div>
            <p className="text-sm text-gray-600">
              Jo'nash vaqti: <span className="font-medium text-gray-900">{departureStart}–{departureEnd}</span>
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {trip.pickupType === 'HOME_PICKUP' && (
              <Badge className="bg-primary-50 text-primary-700 border-0 text-xs px-2.5 py-1">
                <Home className="h-3 w-3 mr-1" />
                Uydan olish
              </Badge>
            )}
            {trip.deliveryType === 'CARGO_ACCEPTED' && (
              <Badge className="bg-secondary-50 text-secondary-700 border-0 text-xs px-2.5 py-1">
                <Package className="h-3 w-3 mr-1" />
                Yuk qabul qiladi
              </Badge>
            )}
          </div>

          {/* CTA */}
          {isOwnTrip ? (
            <div className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl text-center text-sm">
              Bu sizning safaringiz
            </div>
          ) : trip.availableSeats === 0 ? (
            <div className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl text-center text-sm">
              Barcha o'rinlar band
            </div>
          ) : (
            <Button
              onClick={() => onReserve(trip.id)}
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat & Rezervatsiya (10 min)
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
