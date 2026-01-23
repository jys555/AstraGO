'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp } from '@/lib/telegram';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface TelegramGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that ensures app only runs in Telegram Mini App
 * Shows error message if not in Telegram
 */
export function TelegramGuard({ children }: TelegramGuardProps) {
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkTelegram = () => {
      const inTelegram = isTelegramWebApp();
      setIsInTelegram(inTelegram);
      
      // In development, show warning but allow
      if (!inTelegram && process.env.NODE_ENV === 'development') {
        setShowWarning(true);
      }
    };

    checkTelegram();
  }, []);

  // Show loading while checking
  if (isInTelegram === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not in Telegram and production, show error
  if (!isInTelegram && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Telegram Mini App Required
            </h1>
            <p className="text-gray-600 mb-6">
              This application can only be accessed through the AstraGo Telegram bot.
              Please open it from Telegram.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                To use this app:
              </p>
              <ol className="text-sm text-gray-600 text-left list-decimal list-inside space-y-1">
                <li>Open Telegram</li>
                <li>Search for @AstraGO_bot</li>
                <li>Start the bot and open the Mini App</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show warning in development
  if (showWarning) {
    return (
      <>
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm text-yellow-800">
              ⚠️ Development Mode: Not running in Telegram. Some features may not work.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="text-yellow-800 hover:text-yellow-900"
            >
              ✕
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
