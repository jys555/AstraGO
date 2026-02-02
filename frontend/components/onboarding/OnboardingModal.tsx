'use client';

import { useState } from 'react';
import { X, Pin, Bell, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  isOpen: boolean;
  currentStep: number;
  onStepComplete: (step: number, action: 'next' | 'later', notifOptIn?: boolean) => void;
  onClose: () => void;
}

export function OnboardingModal({
  isOpen,
  currentStep,
  onStepComplete,
  onClose,
}: OnboardingModalProps) {
  const [showPinInstructions, setShowPinInstructions] = useState(false);

  if (!isOpen) return null;

  const handleNext = (notifOptIn?: boolean) => {
    if (currentStep < 3) {
      onStepComplete(currentStep, 'next', notifOptIn);
    } else {
      onStepComplete(3, 'next', notifOptIn);
      onClose();
    }
  };

  const handleLater = () => {
    onStepComplete(currentStep, 'later');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress indicator */}
          <div className="flex gap-2 justify-center pt-6 pb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step <= currentStep
                    ? 'bg-primary-500 w-8'
                    : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center">
                      <Pin className="h-8 w-8 text-primary-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    AstraGo doim ko'rinib tursin
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Reyslar, javoblar va kelishuvlarni o'tkazib yubormaslik uchun AstraGo chatini Telegram'da PIN qiling.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Bu 10 soniya: chatni bosib turing → Pin.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowPinInstructions(true)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                    >
                      Qanday PIN qilinadi?
                    </Button>
                    <Button
                      onClick={() => handleNext()}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl"
                    >
                      Keyingi
                    </Button>
                    <button
                      onClick={handleLater}
                      className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2"
                    >
                      Keyinroq
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                      <Bell className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Faqat muhim xabarlar
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Biz faqat reys, zaxira va kelishuv bo'yicha muhim xabar yuboramiz. Spam yo'q.
                  </p>
                  <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Haydovchi javob berdi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Zaxira tugashiga oz qoldi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Reys tasdiqlandi yoki bekor bo'ldi</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Bildirishnomalar Telegram ichida keladi.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        handleNext(true); // Opt in
                      }}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                    >
                      Bildirishnomalarni yoqish
                    </Button>
                    <button
                      onClick={() => {
                        handleNext(false); // Opt out
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2"
                    >
                      O'chiq qoldirish
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-yellow-50 flex items-center justify-center">
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Tez kirish
                  </h2>
                  <p className="text-gray-600 mb-6">
                    AstraGo'ga tez kirish uchun chatni PIN qiling yoki Favorites'da saqlang. Shunda 1 bosishda ochasiz.
                  </p>
                  <Button
                    onClick={() => handleNext()}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                  >
                    Tushundim
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* PIN Instructions Bottom Sheet */}
      {showPinInstructions && (
        <PinInstructionsSheet
          onClose={() => setShowPinInstructions(false)}
        />
      )}
    </div>
  );
}

function PinInstructionsSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-end bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Qanday PIN qilinadi?</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Telegram'da AstraGo chatini toping
              </h4>
              <p className="text-sm text-gray-600">
                Chatlar ro'yxatida AstraGo botini toping
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Chatni bosib turing
              </h4>
              <p className="text-sm text-gray-600">
                Chat nomiga uzoqroq bosib turing (long press)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                📌 Pin ni tanlang
              </h4>
              <p className="text-sm text-gray-600">
                Menyudan "Pin" yoki "Pin chat" ni tanlang
              </p>
            </div>
          </div>

          {/* Illustration placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Pin className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Ko'rsatma</p>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
        >
          Tushundim
        </Button>
      </motion.div>
    </motion.div>
  );
}
