'use client';

import React from 'react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            AstraGo
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Qidirish
            </Link>
            <Link
              href="/my-trips"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Mening Safarlarim
            </Link>
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};
