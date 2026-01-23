import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { TelegramGuard } from '@/components/telegram/TelegramGuard';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AstraGo - Shared Taxi Platform',
  description: 'Intercity and interregional shared taxi services',
};

// Force all pages to be dynamic (disable static generation)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Telegram WebApp SDK - Required for Mini App */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {/* Google Maps API - Only load if API key is provided */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async`}
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={inter.className}>
        <TelegramGuard>
          <Providers>
            <Header />
            {children}
          </Providers>
        </TelegramGuard>
      </body>
    </html>
  );
}
