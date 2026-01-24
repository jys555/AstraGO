'use client';

import { useState, useEffect } from 'react';

interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}

const banners: Banner[] = [
  {
    id: '1',
    image: '/banner1.jpg',
    title: 'Qulay va Xavfsiz Safar',
    description: 'Shaharlararo safarlar uchun eng qulay va xavfsiz transport xizmati',
    actionText: 'Hoziroq qidirish',
    actionLink: '/trips',
  },
  {
    id: '2',
    image: '/banner2.jpg',
    title: 'Real Vaqtda Rezervatsiya',
    description: '10 daqiqalik bepul rezervatsiya bilan haydovchi bilan muzokara qiling',
    actionText: 'Batafsil',
    actionLink: '/about',
  },
  {
    id: '3',
    image: '/banner3.jpg',
    title: 'Ishonchli Haydovchilar',
    description: 'Javob berish tezligi va ishonchliligi bo\'yicha reytinglangan haydovchilar',
    actionText: 'Qidirish',
    actionLink: '/trips',
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-48 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">{currentBanner.title}</h2>
          <p className="text-sm opacity-90 mb-4">{currentBanner.description}</p>
          {currentBanner.actionText && (
            <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold text-sm">
              {currentBanner.actionText}
            </button>
          )}
        </div>
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
