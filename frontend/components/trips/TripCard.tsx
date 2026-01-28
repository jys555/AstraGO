import React from 'react';
import { Car, Users, Home, Package, Star, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white mb-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Driver Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-gray-100">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {trip.driver.firstName?.[0] || '?'}{trip.driver.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {trip.driver.firstName} {trip.driver.lastName}
              </h3>
              {trip.driver.driverMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {trip.driver.driverMetrics.rankingScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="flex-1 space-y-4">
            {/* Route & Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{trip.routeFrom}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-900">{trip.routeTo}</span>
              </div>
              <p className="text-sm text-gray-600">
                Jo'nash vaqti: <span className="font-medium text-gray-900">{departureStart} - {departureEnd}</span>
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
                <VehicleIcon className="h-3.5 w-3.5 mr-1.5" />
                {trip.vehicleType}
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {trip.availableSeats} o'rin
              </Badge>
              {trip.pickupType === 'HOME_PICKUP' && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-0">
                  <Home className="h-3.5 w-3.5 mr-1.5" />
                  Uydan olish
                </Badge>
              )}
              {trip.deliveryType === 'CARGO_ACCEPTED' && (
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-0">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  Yuk qabul qiladi
                </Badge>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex lg:flex-col items-end lg:items-center justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
            <div className="text-right lg:text-center">
              <div className="text-sm text-gray-500">Bo'sh o'rinlar</div>
              <div className="text-lg font-bold text-gray-900">{trip.availableSeats} / {trip.totalSeats}</div>
            </div>
            <Button
              onClick={() => onReserve(trip.id)}
              disabled={trip.availableSeats === 0 || isLoading}
              isLoading={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white h-11 px-6 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat va Rezervatsiya
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
