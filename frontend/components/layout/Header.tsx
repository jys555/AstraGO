import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            AstraGo
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Search
            </Link>
            <Link
              href="/my-trips"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              My Trips
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
