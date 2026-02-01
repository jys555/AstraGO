'use client';

import { useState } from 'react';
import { X, Pin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export type BannerType = 'pin' | 'notifications';

interface NudgeBannerProps {
  type: BannerType;
  onDismiss: () => void;
  onAction: () => void;
}

export function NudgeBanner({ type, onDismiss, onAction }: NudgeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const content = {
    pin: {
      icon: Pin,
      title: "AstraGo'ni yo'qotib qo'ymang",
      text: "Chatni PIN qilsangiz reys xabarlari doim ko'rinadi.",
      cta: "Ko'rsatma",
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    notifications: {
      icon: Bell,
      title: 'Muhim xabarlar',
      text: "Haydovchi javobini o'tkazib yubormang.",
      cta: 'Yoqish',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  };

  const config = content[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`${config.bgColor} border-0 p-4 mb-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {config.title}
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  {config.text}
                </p>
                <Button
                  onClick={onAction}
                  size="sm"
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 text-xs font-medium py-1.5 px-3 rounded-lg"
                >
                  {config.cta}
                </Button>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
