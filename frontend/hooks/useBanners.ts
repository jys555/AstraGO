'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useBanners(enabled: boolean = true) {
  const { data: pinBanner, isLoading: pinLoading } = useQuery({
    queryKey: ['banners', 'pin'],
    queryFn: async () => {
      const response = await apiClient.getBannerVisibility('pin');
      return response.shouldShow;
    },
    enabled,
    retry: false,
  });

  const { data: notifBanner, isLoading: notifLoading } = useQuery({
    queryKey: ['banners', 'notifications'],
    queryFn: async () => {
      const response = await apiClient.getBannerVisibility('notifications');
      return response.shouldShow;
    },
    enabled,
    retry: false,
  });

  return {
    shouldShowPinBanner: pinBanner ?? false,
    shouldShowNotifBanner: notifBanner ?? false,
    isLoading: pinLoading || notifLoading,
  };
}
