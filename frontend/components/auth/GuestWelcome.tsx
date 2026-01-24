'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface GuestWelcomeProps {
  onRegister: () => void;
}

export function GuestWelcome({ onRegister }: GuestWelcomeProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">🚗</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AstraGo'ga Xush Kelibsiz!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Shaharlararo va mintaqalararo umumiy taksi xizmatlari platformasi
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-2">Safarlarni Qidiring</h3>
              <p className="text-sm text-gray-600">
                Qayerdan qayerga borishni tanlang va mavjud safarlarni ko'ring
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold mb-2">Haydovchi bilan Bog'laning</h3>
              <p className="text-sm text-gray-600">
                10 daqiqalik bepul rezervatsiya va chat orqali muzokara qiling
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold mb-2">Rezervatsiya Qiling</h3>
              <p className="text-sm text-gray-600">
                O'zingizga mos safarni topib, o'rin band qiling
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onRegister}
              className="w-full py-3 text-lg"
              size="lg"
            >
              Ro'yxatdan O'tish
            </Button>
            <p className="text-sm text-gray-500">
              Ro'yxatdan o'tish orqali safarlarni ko'rish, rezervatsiya qilish va boshqa barcha funksiyalardan foydalanishingiz mumkin
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}
