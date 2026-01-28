'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ImageWithFallback } from '../common/ImageWithFallback';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1706612625425-3f14f487e548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmF2ZWwlMjBhZHZlbnR1cmUlMjByb2FkfGVufDF8fHx8MTc2OTU4MDQyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Safar Qiling',
    subtitle: 'AstraGo bilan yangi yo\'nalishlarni kashf eting',
    color: 'from-blue-500/90 to-purple-500/90'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1644077580148-6e9de8ca18f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzaGFyaW5nJTIwcmlkZXNoYXJlfGVufDF8fHx8MTc2OTU4MDQyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Safaringizni Ulashing',
    subtitle: 'Pul tejang va yangi odamlar bilan tanishing',
    color: 'from-green-500/90 to-teal-500/90'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1768839721483-c4501b5d6eb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMHByb21vdGlvbiUyMGJhbm5lcnxlbnwxfHx8fDE3Njk1ODA0MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Maxsus Taklif',
    subtitle: 'Birinchi safaringiz uchun 20% chegirma!',
    color: 'from-orange-500/90 to-red-500/90'
  }
];

export function BannerCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    cssEase: 'ease-in-out',
    dotsClass: 'slick-dots custom-dots',
  };

  return (
    <div className="banner-carousel-container" style={{ padding: '0 16px 16px', gap: '10px' }}>
      <style jsx>{`
        .banner-carousel-container :global(.slick-dots) {
          bottom: 20px;
        }
        .banner-carousel-container :global(.slick-dots li button:before) {
          color: white;
          opacity: 0.5;
          font-size: 8px;
        }
        .banner-carousel-container :global(.slick-dots li.slick-active button:before) {
          opacity: 1;
          color: white;
        }
        .banner-carousel-container :global(.slick-slide > div) {
          margin: 0;
        }
        .banner-carousel-container :global(.slick-list) {
          border-radius: 12px;
        }
      `}</style>
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="outline-none" style={{ flex: '0 0 100%' }}>
            <div 
              className="relative overflow-hidden group"
              style={{ 
                aspectRatio: '2184 / 927',
                borderRadius: '12px'
              }}
            >
              <ImageWithFallback
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color}`} />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg sm:text-xl drop-shadow-md opacity-95">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
