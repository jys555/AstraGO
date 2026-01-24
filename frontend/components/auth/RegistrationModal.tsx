'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UserRole = 'PASSENGER' | 'DRIVER' | 'BOTH';

export function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'PASSENGER' as UserRole,
    carNumber: '',
    carModel: '',
    carColor: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const registrationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      };

      // Add car fields if driver
      if (data.role === 'DRIVER' || data.role === 'BOTH') {
        payload.carNumber = data.carNumber;
        payload.carModel = data.carModel;
        payload.carColor = data.carColor;
      }

      return apiClient.post('/users/register', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.details) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Registration failed' });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Ism kiritilishi shart';
    if (!formData.lastName.trim()) newErrors.lastName = 'Familiya kiritilishi shart';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon raqami kiritilishi shart';
    
    if (formData.role === 'DRIVER' || formData.role === 'BOTH') {
      if (!formData.carNumber.trim()) newErrors.carNumber = 'Mashina raqami kiritilishi shart';
      if (!formData.carModel.trim()) newErrors.carModel = 'Mashina modeli kiritilishi shart';
      if (!formData.carColor.trim()) newErrors.carColor = 'Mashina rangi kiritilishi shart';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registrationMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Ro'yxatdan O'tish</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ism <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ismingizni kiriting"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Familiya <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Familiyangizni kiriting"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+998901234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PASSENGER">Yo'lovchi</option>
                <option value="DRIVER">Haydovchi</option>
                <option value="BOTH">Haydovchi & Yo'lovchi</option>
              </select>
            </div>

            {(formData.role === 'DRIVER' || formData.role === 'BOTH') && (
              <>
                <div className="pt-2 border-t">
                  <h3 className="text-lg font-semibold mb-3">Mashina Ma'lumotlari</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mashina Raqami <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.carNumber}
                    onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.carNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="01 A 123 AB"
                  />
                  {errors.carNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.carNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mashina Modeli <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.carModel}
                    onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.carModel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nexia, Cobalt, Malibu..."
                  />
                  {errors.carModel && (
                    <p className="mt-1 text-sm text-red-600">{errors.carModel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mashina Rangi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.carColor}
                    onChange={(e) => setFormData({ ...formData, carColor: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.carColor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Oq, Qora, Ko'k..."
                  />
                  {errors.carColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.carColor}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={registrationMutation.isPending}
              >
                Bekor Qilish
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={registrationMutation.isPending}
              >
                {registrationMutation.isPending ? 'Yuklanmoqda...' : 'Ro\'yxatdan O\'tish'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
