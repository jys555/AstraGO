import React, { useState } from 'react';
import { TripCard } from './TripCard';
import { Trip, TripFilters } from '@/types';
import { Button } from '../ui/Button';

interface TripListProps {
  trips: Trip[];
  onReserve: (tripId: string) => void;
  isLoading?: boolean;
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  onReserve,
  isLoading,
  filters,
  onFiltersChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (key: keyof TripFilters) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filters */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>

        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleFilter('onlineOnly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.onlineOnly
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Online Only
              </button>
              <button
                onClick={() => toggleFilter('homePickup')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.homePickup
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Home Pickup
              </button>
              <button
                onClick={() => toggleFilter('cargoAccepted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.cargoAccepted
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cargo Accepted
              </button>
              <button
                onClick={() => toggleFilter('earliestDeparture')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.earliestDeparture
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Earliest Departure
              </button>
            </div>

            <div className="flex gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={filters.sortBy || 'departure'}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    sortBy: e.target.value as 'departure' | 'seats' | 'ranking',
                  })
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="departure">Departure Time</option>
                <option value="seats">Available Seats</option>
                <option value="ranking">Driver Ranking</option>
              </select>
              <select
                value={filters.order || 'asc'}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    order: e.target.value as 'asc' | 'desc',
                  })
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Trip Cards */}
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No trips found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div>
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onReserve={onReserve}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
