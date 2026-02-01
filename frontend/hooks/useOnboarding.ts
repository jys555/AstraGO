'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useOnboarding() {
  const queryClient = useQueryClient();

  const { data: onboardingState, isLoading } = useQuery({
    queryKey: ['onboarding', 'state'],
    queryFn: async () => {
      const response = await apiClient.getOnboardingState();
      return response.state;
    },
    retry: false,
  });

  const completeStepMutation = useMutation({
    mutationFn: async ({ step, action }: { step: number; action: 'next' | 'later' }) => {
      return apiClient.completeOnboardingStep(step, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ notifOptIn, weeklyDigestOptIn }: { notifOptIn: boolean; weeklyDigestOptIn?: boolean }) => {
      return apiClient.updateNotificationPreferences(notifOptIn, weeklyDigestOptIn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });

  const dismissBannerMutation = useMutation({
    mutationFn: async (type: 'pin' | 'notifications') => {
      return apiClient.dismissBanner(type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const updateLastAppOpenMutation = useMutation({
    mutationFn: async () => {
      return apiClient.updateLastAppOpen();
    },
  });

  return {
    onboardingState,
    isLoading,
    completeStep: completeStepMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    dismissBanner: dismissBannerMutation.mutate,
    updateLastAppOpen: updateLastAppOpenMutation.mutate,
  };
}
