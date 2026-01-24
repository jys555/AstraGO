'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { initTelegramWebApp, getTelegramUser } from '@/lib/telegram';
import { WebSocketInitializer } from '@/components/websocket/WebSocketInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient using useState to ensure it's only created once per client instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = initTelegramWebApp();
    
    if (tg) {
      const user = getTelegramUser();
      if (user) {
        // Use Telegram user ID
        const telegramUserId = String(user.id);
        setUserId(telegramUserId);
        
        // Store for API calls
        if (typeof window !== 'undefined') {
          localStorage.setItem('dev_user_id', telegramUserId);
        }
      }
    } else {
      // Development mode - use stored user ID or create one
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('dev_user_id');
        if (stored) {
          setUserId(stored);
        } else {
          const devUserId = `dev_${Date.now()}`;
          localStorage.setItem('dev_user_id', devUserId);
          setUserId(devUserId);
        }
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketInitializer userId={userId} />
      {children}
    </QueryClientProvider>
  );
}
