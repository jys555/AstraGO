'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  from: string;
  to: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  readonly?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  from,
  to,
  onLocationSelect,
  initialLocation,
  readonly = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Google Maps is available
    if (typeof window === 'undefined' || !(window as any).google) {
      // Fallback: Show a placeholder or use a different map provider
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) return;

    const google = (window as any).google;
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: initialLocation || { lat: 0, lng: 0 },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    });

    setMap(mapInstance);

    // Add click handler if not readonly
    if (!readonly && onLocationSelect) {
      mapInstance.addListener('click', (e: any) => {
        const location = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          address: '', // Would need geocoding to get address
        };

        // Create or update marker
        if (marker) {
          marker.setPosition(e.latLng);
        } else {
          const newMarker = new google.maps.Marker({
            position: e.latLng,
            map: mapInstance,
            draggable: true,
          });
          setMarker(newMarker);

          newMarker.addListener('dragend', (e: any) => {
            if (onLocationSelect) {
              onLocationSelect({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                address: '',
              });
            }
          });
        }

        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });
    }

    setIsLoading(false);
  }, [initialLocation, readonly, onLocationSelect]);

  // Geocode addresses to show route
  useEffect(() => {
    if (!map || !from || !to) return;

    const google = (window as any).google;
    const geocoder = new google.maps.Geocoder();

    // Geocode both addresses and show route
    Promise.all([
      new Promise<any>((resolve) => geocoder.geocode({ address: from }, resolve)),
      new Promise<any>((resolve) => geocoder.geocode({ address: to }, resolve)),
    ]).then(([fromResult, toResult]) => {
      if (fromResult[0] && toResult[0]) {
        const fromLocation = fromResult[0].geometry.location;
        const toLocation = toResult[0].geometry.location;

        // Add markers
        new google.maps.Marker({
          position: fromLocation,
          map,
          label: 'A',
          title: from,
        });

        new google.maps.Marker({
          position: toLocation,
          map,
          label: 'B',
          title: to,
        });

        // Show route
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({ map });

        directionsService.route(
          {
            origin: fromLocation,
            destination: toLocation,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            }
          }
        );

        // Fit bounds
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(fromLocation);
        bounds.extend(toLocation);
        map.fitBounds(bounds);
      }
    });
  }, [map, from, to]);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
      {!readonly && (
        <div className="bg-white p-2 text-xs text-gray-600 border-t">
          {onLocationSelect
            ? 'Click on the map to select your location'
            : 'Map view'}
        </div>
      )}
    </div>
  );
};
