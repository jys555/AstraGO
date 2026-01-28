'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { getCurrentLocation, reverseGeocode, Location } from '@/lib/location';
import { MapView } from '../maps/MapView';

interface LocationPickerProps {
  label: string;
  value?: Location;
  onChange: (location: Location) => void;
  required?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(value?.address || '');

  useEffect(() => {
    if (value?.address) {
      setAddress(value.address);
    }
  }, [value]);

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      const addr = await reverseGeocode(location.lat, location.lng);
      const newLocation = { ...location, address: addr };
      onChange(newLocation);
      setAddress(addr);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get your location. Please try selecting on the map.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapSelect = (location: Location) => {
    onChange(location);
    if (location.address) {
      setAddress(location.address);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            {address || `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          isLoading={isLoading}
        >
          Use Current Location
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? 'Hide' : 'Show'} Map
        </Button>
      </div>

      {showMap && (
        <div className="mt-4">
          <MapView
            from=""
            to=""
            onLocationSelect={handleMapSelect}
            initialLocation={value}
            readonly={false}
          />
        </div>
      )}
    </div>
  );
};
