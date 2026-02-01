'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, reason?: string, comment?: string) => void;
  reservationId: string;
  tripRoute: string;
  isLoading?: boolean;
}

// Review reasons based on rating
const REVIEW_REASONS_BY_RATING: Record<number, Array<{ value: string; label: string }>> = {
  5: [
    { value: 'FRIENDLY_DRIVER', label: 'Haydovchi xushmuomalali' },
    { value: 'EXCELLENT_VEHICLE', label: 'Mashina saloni a\'lo holatda' },
    { value: 'FAST_DELIVERY', label: 'Tez yetkazdi' },
    { value: 'OTHER', label: 'Boshqa' },
  ],
  4: [
    { value: 'GOOD_SERVICE', label: 'Yaxshi xizmat' },
    { value: 'CLEAN_VEHICLE', label: 'Mashina toza' },
    { value: 'ON_TIME', label: 'Vaqtida yetkazdi' },
    { value: 'OTHER', label: 'Boshqa' },
  ],
  3: [
    { value: 'RUDE_BEHAVIOR', label: 'Haydovchi qo\'pol' },
    { value: 'POOR_VEHICLE', label: 'Mashina saloni yaxshi emas' },
    { value: 'LATE_DELIVERY', label: 'Rejadagidan ortiq vaqtda yetkazdi' },
    { value: 'OTHER', label: 'Boshqa' },
  ],
  2: [
    { value: 'RUDE_BEHAVIOR', label: 'Haydovchi qo\'pol' },
    { value: 'POOR_VEHICLE', label: 'Mashina saloni yaxshi emas' },
    { value: 'LATE_DELIVERY', label: 'Rejadagidan ortiq vaqtda yetkazdi' },
    { value: 'UNSAFE_DRIVING', label: 'Xavfsiz haydash' },
    { value: 'OTHER', label: 'Boshqa' },
  ],
  1: [
    { value: 'RUDE_BEHAVIOR', label: 'Haydovchi qo\'pol' },
    { value: 'POOR_VEHICLE', label: 'Mashina saloni yaxshi emas' },
    { value: 'LATE_DELIVERY', label: 'Rejadagidan ortiq vaqtda yetkazdi' },
    { value: 'UNSAFE_DRIVING', label: 'Xavfsiz haydash' },
    { value: 'POOR_COMMUNICATION', label: 'Yomon aloqa' },
    { value: 'OTHER', label: 'Boshqa' },
  ],
};

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  reservationId,
  tripRoute,
  isLoading = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  // Get reasons for current rating
  const currentReasons = rating > 0 ? REVIEW_REASONS_BY_RATING[rating] || [] : [];

  if (!isOpen) return null;

  const handleReasonToggle = (reasonValue: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonValue)
        ? prev.filter((r) => r !== reasonValue)
        : [...prev, reasonValue]
    );
  };

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      alert('Iltimos, baholashni tanlang (1-5 yulduz)');
      return;
    }
    // Use first selected reason or undefined
    const reason = selectedReasons.length > 0 ? selectedReasons[0] : undefined;
    onSubmit(rating, reason, comment.trim() || undefined);
    // Reset form
    setRating(0);
    setSelectedReasons([]);
    setComment('');
  };

  // Reset selected reasons when rating changes
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setSelectedReasons([]);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Safarni Baholash</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">{tripRoute}</p>
            <p className="text-sm font-medium text-gray-900">Safarni qanday baholaysiz?</p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Reason Selection (multichoice based on rating) */}
          {rating > 0 && currentReasons.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sababni tanlang (ixtiyoriy, bir nechtasini tanlash mumkin)
              </label>
              <div className="space-y-2">
                {currentReasons.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason.value)}
                      onChange={() => handleReasonToggle(reason.value)}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Izoh (ixtiyoriy)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Safaringiz haqida fikringiz..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Yopish
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={rating < 1 || isLoading}
              isLoading={isLoading}
            >
              Yuborish
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
