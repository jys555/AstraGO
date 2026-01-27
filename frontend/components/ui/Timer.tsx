import React from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  timeRemaining: number; // in milliseconds
  onExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, onExpire }) => {
  const totalSeconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const progress = timeRemaining / (10 * 60 * 1000); // 10 minutes total
  const percentage = Math.max(0, Math.min(100, progress * 100));

  // Color based on time remaining
  let colorClass = 'text-green-600';
  let bgColorClass = 'bg-green-100';
  if (percentage < 33) {
    colorClass = 'text-red-600';
    bgColorClass = 'bg-red-100';
  } else if (percentage < 66) {
    colorClass = 'text-yellow-600';
    bgColorClass = 'bg-yellow-100';
  }

  React.useEffect(() => {
    if (timeRemaining === 0 && onExpire) {
      onExpire();
    }
  }, [timeRemaining, onExpire]);

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass} ${colorClass} font-bold text-lg`}>
        <motion.div
          key={totalSeconds}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
      </div>
      <div className="flex-1">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${bgColorClass.replace('100', '500')}`}
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">Rezervatsiya {minutes} daq {seconds} soniyadan keyin tugaydi</p>
      </div>
    </div>
  );
};
