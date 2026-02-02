'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RouteSearch } from '@/components/search/RouteSearch';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { BenefitsCarousel } from '@/components/home/BenefitsCarousel';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { NudgeBanner } from '@/components/onboarding/NudgeBanner';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useBanners } from '@/hooks/useBanners';
import { Search, Car } from 'lucide-react';

// Disable SSR for pages that use React Query
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationContext, setRegistrationContext] = useState<'search' | 'create' | null>(null);

  // Get user data to determine role
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const user = userData?.user;
  const userRole = user?.role || 'PASSENGER';
  const isProfileComplete = !!(user?.firstName && user?.phone);

  // Onboarding hooks
  const { onboardingState, completeStep, updatePreferences, updateLastAppOpen, dismissBanner } = useOnboarding();
  const { shouldShowPinBanner, shouldShowNotifBanner, isLoading: bannersLoading } = useBanners(!!user);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Update last app open on mount
  useEffect(() => {
    if (user) {
      updateLastAppOpen();
    }
  }, [user, updateLastAppOpen]);

  // Check if onboarding should be shown
  useEffect(() => {
    if (onboardingState && !onboardingState.onboardingCompletedAt) {
      // Always start at step 1 for new users
      setOnboardingStep(1);
      setShowOnboarding(true);
    } else if (onboardingState?.onboardingCompletedAt) {
      setShowOnboarding(false);
    }
  }, [onboardingState]);

  // Handle post-registration redirect
  useEffect(() => {
    if (user && isProfileComplete) {
      const pendingAction = sessionStorage.getItem('pendingAction');
      if (pendingAction) {
        sessionStorage.removeItem('pendingAction');
        
        // Navigate based on action and role
        if (pendingAction === 'search') {
          // User clicked "Search trip"
          if (userRole === 'PASSENGER') {
            // Passenger registered for search - go to trips page
            router.push('/trips');
          } else {
            // Driver registered but clicked search - stay on home page (driver home)
            // Already on home page, no redirect needed
          }
        } else if (pendingAction === 'create') {
          // User clicked "Create trip"
          if (userRole === 'DRIVER') {
            // Driver registered for create - go to create trip page
            router.push('/trips/create');
          } else {
            // Passenger registered but clicked create - stay on home page (passenger home)
            // Already on home page, no redirect needed
          }
        }
      }
    }
  }, [user, isProfileComplete, userRole, router]);

  const handleSearchClick = () => {
    if (!user || !isProfileComplete) {
      // Store search intent
      sessionStorage.setItem('pendingAction', 'search');
      setRegistrationContext('search');
      setShowRegistration(true);
      return;
    }
    // User is registered - navigate to trips page
    router.push('/trips');
  };

  const handleCreateTripClick = () => {
    if (!user || !isProfileComplete) {
      // Store create trip intent
      sessionStorage.setItem('pendingAction', 'create');
      setRegistrationContext('create');
      setShowRegistration(true);
      return;
    }
    // User is registered - navigate to create trip page
    router.push('/trips/create');
  };

  const handleRegistrationSuccess = async () => {
    setShowRegistration(false);
    const pendingAction = sessionStorage.getItem('pendingAction');
    
    // Clear pending action
    sessionStorage.removeItem('pendingAction');

    // Wait a bit for user data to be updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload to get fresh user data
    window.location.reload();
  };

  const handleSearch = (from: string, to: string, date: string, passengerCount?: number) => {
    // Build URL with all params including passengerCount
    const urlParams = new URLSearchParams({
      from,
      to,
      date,
      ...(passengerCount && passengerCount > 1 ? { passengerCount: passengerCount.toString() } : {}),
    });
    router.push(`/trips?${urlParams.toString()}`);
  };

  const handleCreateTrip = () => {
    router.push('/trips/create');
  };

  // Show unified homepage - guest mode or role-based for registered users
  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <AppHeader />
        
        {/* Rounded top corners with banner carousel */}
        <div className="bg-white rounded-t-3xl -mt-4 relative z-10">
          <BannerCarousel />
          
          {/* Guest mode - show general info and presentation */}
          {(!user || !isProfileComplete) ? (
            <div className="px-4 py-6 space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  AstraGo - Qulay Safar
                </h1>
                <p className="text-sm text-gray-600">
                  Xavfsiz va qulay safar uchun eng yaxshi yechim
                </p>
              </div>

              {/* Benefits Carousel */}
              <BenefitsCarousel />

              {/* Action Buttons for Guests */}
              <div className="space-y-4">
                <div className="bg-gradient-to-b from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Shaharlararo uzingizga qulay Taxi qidiryapsizmi?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sizga mos reyslar buyerda 👇
                    </p>
                  </div>

                  <Button
                    onClick={handleSearchClick}
                    variant="primary"
                    className="w-full h-14 text-lg font-semibold"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Safar Qidirish
                  </Button>
                </div>

                <div className="bg-gradient-to-b from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Siz haydovchisiz va yo'lovchilar sizni topishini xohlaysizmi?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Safaringizni yarating va yo'lovchilarni toping. Qulay narxlar va tez to'lovlar
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateTripClick}
                    variant="primary"
                    className="w-full h-14 text-lg font-semibold"
                  >
                    <Car className="h-5 w-5 mr-2" />
                    Safar Yaratish
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Registered user - role-based content */
            <>
              {/* Nudge Banners */}
              {user && !bannersLoading && (
                <div className="px-4 pt-4">
                  {shouldShowPinBanner && (
                    <NudgeBanner
                      type="pin"
                      onDismiss={() => dismissBanner('pin')}
                      onAction={() => {
                        // Show PIN instructions - could open onboarding step 1 or show instructions
                        setShowOnboarding(true);
                        setOnboardingStep(1);
                      }}
                    />
                  )}
                  {shouldShowNotifBanner && !shouldShowPinBanner && (
                    <NudgeBanner
                      type="notifications"
                      onDismiss={() => dismissBanner('notifications')}
                      onAction={() => {
                        updatePreferences({ notifOptIn: true });
                      }}
                    />
                  )}
                </div>
              )}

              {userRole === 'PASSENGER' && (
                <>
                  {/* Passenger Search Section */}
                  <div className="px-4 py-6 space-y-6">
                    <RouteSearch
                      onSearch={handleSearch}
                    />

                    {/* Quick Filters */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Tezkor Filtrlar</h3>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          ✓ Onlayn haydovchilar
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          ⏰ Eng tezkor jo'nash
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          🏠 Uydan olish
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-all">
                          📦 Yuk qabul qiladi
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {userRole === 'DRIVER' && (
                <>
                  {/* Driver Section */}
                  <div className="px-4 py-6">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Haydovchi Paneli
                      </h1>
                      <p className="text-sm text-gray-600">
                        Safar yaratish va boshqarish
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleCreateTrip}
                        variant="primary"
                        className="w-full"
                      >
                        🚗 Yangi Safar Yaratish
                      </Button>

                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Yo'nalishlar va Tushunchalar</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• Safar yaratish: Yo'nalish, vaqt va narxni belgilang</li>
                          <li>• Rezervatsiyalar: Yo'lovchilarning rezervatsiyalarini ko'ring va tasdiqlang</li>
                          <li>• Chat: Yo'lovchilar bilan to'g'ridan-to'g'ri aloqa</li>
                          <li>• Reyting: Javob berish darajasi va o'rtacha javob vaqti</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => {
          setShowRegistration(false);
          sessionStorage.removeItem('pendingAction');
        }}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Onboarding Modal */}
      {showOnboarding && onboardingStep && (
        <OnboardingModal
          isOpen={showOnboarding}
          currentStep={onboardingStep}
          onStepComplete={async (step, action, notifOptIn) => {
            // Handle step 2 notification preference first
            if (step === 2 && action === 'next' && notifOptIn !== undefined) {
              await updatePreferences({ notifOptIn });
            }
            
            // Complete the step
            await completeStep({ step, action });
            
            // Navigate to next step or close
            if (action === 'next' && step < 3) {
              setOnboardingStep(step + 1);
            } else if (action === 'next' && step === 3) {
              setShowOnboarding(false);
            } else if (action === 'later') {
              setShowOnboarding(false);
            }
          }}
          onClose={() => {
            setShowOnboarding(false);
          }}
        />
      )}
    </RegistrationGuard>
  );
}
