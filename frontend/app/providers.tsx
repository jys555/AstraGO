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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Function to initialize Telegram and get user
    const initializeTelegram = () => {
      // Initialize Telegram WebApp
      const tg = initTelegramWebApp();
      
      if (tg) {
        // Running in Telegram Mini App
        const user = getTelegramUser();
        if (user) {
          // Use Telegram user ID
          const telegramUserId = String(user.id);
          setUserId(telegramUserId);
          
          // Store for API calls (for development fallback)
          if (typeof window !== 'undefined') {
            localStorage.setItem('dev_user_id', telegramUserId);
          }
          
          console.log('Telegram user authenticated:', {
            id: user.id,
            username: user.username,
            firstName: user.first_name,
          });
          return;
        }
      }
      
      // If in Telegram environment but SDK not loaded yet, retry
      if (typeof window !== 'undefined' && window.location.hostname.includes('telegram.org')) {
        let retryCount = 0;
        const maxRetries = 10;
        
        const retryInit = () => {
          const tg = (window as any).Telegram?.WebApp;
          const user = getTelegramUser();
          
          if (tg && user) {
            const telegramUserId = String(user.id);
            setUserId(telegramUserId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('dev_user_id', telegramUserId);
            }
            console.log('Telegram user authenticated (retry):', {
              id: user.id,
              username: user.username,
            });
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(retryInit, 200);
          }
        };
        
        setTimeout(retryInit, 100);
        return;
      }
      
      // Not in Telegram - only allow in development
      if (process.env.NODE_ENV === 'development') {
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
      } else {
        // Production: require Telegram
        console.error('Not running in Telegram Mini App');
      }
    };
    
    // Initial initialization
    initializeTelegram();
    
    // Also listen for window load event
    if (typeof window !== 'undefined') {
      window.addEventListener('load', initializeTelegram);
      return () => window.removeEventListener('load', initializeTelegram);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isClient && <WebSocketInitializer userId={userId} />}
      {children}
    </QueryClientProvider>
  );
}

// Separate component to initialize WebSocket after QueryClientProvider is mounted
function WebSocketInitializer({ userId }: { userId: string | null }) {
  useWebSocket(userId);
  return null;
}
