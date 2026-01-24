'use client';

interface GuestWelcomeProps {
  onRegister: () => void;
}

export function GuestWelcome({ onRegister }: GuestWelcomeProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Salom, Mehmon!
          </h1>
          <p className="text-gray-600 mb-6">
            AstraGO ga xush kelibsiz! Safarlarni qidirish va rezervatsiya qilish uchun ro'yxatdan o'ting.
          </p>
          <button
            onClick={onRegister}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Ro'yxatdan O'tish
          </button>
        </div>
      </div>
    </div>
  );
}
