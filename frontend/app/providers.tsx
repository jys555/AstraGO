'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { initTelegramWebApp, getTelegramUser } from '@/lib/telegram';
import { useWebSocket } from '@/hooks/useWebSocket';

// Create QueryClient outside component to ensure it's always available
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  // Browser: use singleton pattern to keep the same query client
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use singleton QueryClient to ensure it's always available
  const queryClient = useMemo(() => getQueryClient(), []);

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

  // Initialize WebSocket connection
  useWebSocket(userId);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
