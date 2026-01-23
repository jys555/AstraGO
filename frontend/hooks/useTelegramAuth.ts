'use client';

import { useEffect, useState } from 'react';
import { getTelegramInitData, getTelegramUser } from '@/lib/telegram';

/**
 * Hook to wait for Telegram SDK to load and get initData
 * Retries if SDK is not loaded yet
 */
export function useTelegramAuth() {
  const [initData, setInitData] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 200; // 200ms

    const checkTelegram = () => {
      const tg = (window as any).Telegram?.WebApp;
      const currentInitData = getTelegramInitData();
      const currentUser = getTelegramUser();

      if (currentInitData || currentUser) {
        setInitData(currentInitData);
        setUser(currentUser);
        setIsLoading(false);
        return;
      }

      // If in Telegram environment but SDK not loaded yet, retry
      if (window.location.hostname.includes('telegram.org') && retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkTelegram, retryDelay);
      } else {
        setIsLoading(false);
      }
    };

    // Initial check
    checkTelegram();

    // Also listen for Telegram SDK ready event
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        // Check again after ready
        setTimeout(checkTelegram, 100);
      }
    }
  }, []);

  return { initData, user, isLoading };
}
