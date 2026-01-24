'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Car models list
const CAR_MODELS = [
  'Chevrolet Malibu',
  'Chevrolet Cobalt',
  'Chevrolet Spark',
  'Chevrolet Nexia',
  'Chevrolet Lacetti',
  'Chevrolet Captiva',
  'Chevrolet Tracker',
  'Chevrolet Equinox',
  'Chevrolet Tahoe',
  'Chevrolet Suburban',
  'Toyota Camry',
  'Toyota Corolla',
  'Toyota RAV4',
  'Toyota Land Cruiser',
  'Toyota Highlander',
  'Honda Accord',
  'Honda Civic',
  'Honda CR-V',
  'Hyundai Sonata',
  'Hyundai Elantra',
  'Hyundai Tucson',
  'Hyundai Santa Fe',
  'Kia Optima',
  'Kia Rio',
  'Kia Sportage',
  'Nissan Altima',
  'Nissan Sentra',
  'Nissan X-Trail',
  'Ford Focus',
  'Ford Mondeo',
  'Ford Explorer',
  'BMW 3 Series',
  'BMW 5 Series',
  'Mercedes-Benz C-Class',
  'Mercedes-Benz E-Class',
  'Audi A4',
  'Audi A6',
  'Volkswagen Passat',
  'Volkswagen Jetta',
  'Skoda Octavia',
  'Skoda Superb',
  'Boshqa',
];

// Car colors list
const CAR_COLORS = [
  'Oq',
  'Qora',
  'Kumush',
  'Kulrang',
  'Ko\'k',
  'Qizil',
  'Sariq',
  'Yashil',
  'Jigarrang',
  'Binafsha',
  'Pushti',
  'Boshqa',
];

export function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [role, setRole] = useState<'PASSENGER' | 'DRIVER' | 'BOTH'>('PASSENGER');
  const [carNumber, setCarNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFirstName('');
      setLastName('');
      setPhone('+998 ');
      setRole('PASSENGER');
      setCarNumber('');
      setCarModel('');
      setCarColor('');
      setErrors({});
    }
  }, [isOpen]);

  // Format phone number: +998 00 000 00 00
  const handlePhoneChange = (value: string) => {
    // Remove all non-digits except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +998
    if (!cleaned.startsWith('+998')) {
      cleaned = '+998' + cleaned.replace(/^\+998/, '');
    }
    
    // Limit to +998 and 9 digits
    const digits = cleaned.replace('+998', '').slice(0, 9);
    
    // Format: +998 00 000 00 00
    let formatted = '+998 ';
    if (digits.length > 0) {
      formatted += digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += ' ' + digits.slice(2, 5);
        if (digits.length > 5) {
          formatted += ' ' + digits.slice(5, 7);
          if (digits.length > 7) {
            formatted += ' ' + digits.slice(7, 9);
          }
        }
      }
    }
    
    setPhone(formatted);
  };

  // Format car number: 01 A 123 BC (region number, letter, numbers, letters)
  const handleCarNumberChange = (value: string) => {
    // Remove all spaces and convert to uppercase
    let cleaned = value.replace(/\s/g, '').toUpperCase();
    
    // Only allow digits and letters
    cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
    
    // Format: 01 A 123 BC
    let formatted = '';
    
    // Region number (2 digits)
    if (cleaned.length > 0) {
      const region = cleaned.slice(0, 2).replace(/[^0-9]/g, '');
      if (region.length > 0) {
        formatted = region;
        
        // First letter
        if (cleaned.length > 2) {
          const firstLetter = cleaned.slice(2, 3).replace(/[^A-Z]/g, '');
          if (firstLetter) {
            formatted += ' ' + firstLetter;
            
            // Numbers (3 digits)
            if (cleaned.length > 3) {
              const numbers = cleaned.slice(3, 6).replace(/[^0-9]/g, '');
              if (numbers.length > 0) {
                formatted += ' ' + numbers;
                
                // Last letters (2 letters)
                if (cleaned.length > 6) {
                  const lastLetters = cleaned.slice(6, 8).replace(/[^A-Z]/g, '');
                  if (lastLetters.length > 0) {
                    formatted += ' ' + lastLetters;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    setCarNumber(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'Ism majburiy';
    }
    
    if (!phone || phone.length < 17) { // +998 00 000 00 00 = 17 chars
      newErrors.phone = 'Telefon raqami to\'liq kiritilishi kerak';
    }
    
    if (role === 'DRIVER' || role === 'BOTH') {
      if (!carNumber || carNumber.length < 10) { // 01 A 123 BC = ~10 chars
        newErrors.carNumber = 'Mashina raqami to\'liq kiritilishi kerak';
      }
      if (!carModel) {
        newErrors.carModel = 'Mashina modeli tanlanishi kerak';
      }
      if (!carColor) {
        newErrors.carColor = 'Mashina rangi tanlanishi kerak';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove spaces from phone number for API
      const phoneNumber = phone.replace(/\s/g, '');
      
      await apiClient.registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phoneNumber,
        role,
        carNumber: (role === 'DRIVER' || role === 'BOTH') ? carNumber : undefined,
        carModel: (role === 'DRIVER' || role === 'BOTH') ? carModel : undefined,
        carColor: (role === 'DRIVER' || role === 'BOTH') ? carColor : undefined,
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="register-modal bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <h3>Profilingizni to'ldiring</h3>
        
        <div className="flex-1 overflow-y-auto" ref={modalContentRef}>
          <form onSubmit={handleSubmit} id="registration-form" className="pb-4">
            {/* First Name */}
            <div className="floating-input">
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                className={errors.firstName ? 'border-red-500' : ''}
                placeholder=" "
              />
              <label htmlFor="firstName">Ism</label>
              {(firstName || focusedField === 'firstName') && (
                <span className="floating-placeholder">Ismingizni kiriting</span>
              )}
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="floating-input">
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
              />
              <label htmlFor="lastName">Familiya</label>
              {(lastName || focusedField === 'lastName') && (
                <span className="floating-placeholder">Familiyangizni kiriting</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="floating-input">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
                  <span className="text-xl">🇺🇿</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={(e) => {
                    setFocusedField(null);
                    // Ensure format is complete
                    if (e.target.value.length < 17) {
                      handlePhoneChange(e.target.value);
                    }
                  }}
                  className={`pl-12 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder=" "
                  maxLength={17}
                />
                <label htmlFor="phone" className="left-12">Telefon raqam</label>
                {(phone && phone !== '+998 ') || focusedField === 'phone' ? (
                  <span className="floating-placeholder left-12">+998 00 000 00 00</span>
                ) : null}
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="floating-input">
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'PASSENGER' | 'DRIVER' | 'BOTH')}
                >
                  <option value="PASSENGER">Yo'lovchi</option>
                  <option value="DRIVER">Haydovchi</option>
                  <option value="BOTH">Haydovchi & Yo'lovchi</option>
                </select>
                <label htmlFor="role">Rol</label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Driver-specific fields */}
            {(role === 'DRIVER' || role === 'BOTH') && (
              <>
                {/* Car Number */}
                <div className="floating-input">
                  <input
                    type="text"
                    id="carNumber"
                    value={carNumber}
                    onChange={(e) => handleCarNumberChange(e.target.value)}
                    onFocus={() => setFocusedField('carNumber')}
                    onBlur={() => setFocusedField(null)}
                    className={`uppercase ${errors.carNumber ? 'border-red-500' : ''}`}
                    placeholder=" "
                    maxLength={12}
                  />
                  <label htmlFor="carNumber">Mashina raqami</label>
                  {(carNumber || focusedField === 'carNumber') && (
                    <span className="floating-placeholder">01 A 123 BC</span>
                  )}
                  {errors.carNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.carNumber}</p>
                  )}
                </div>

                {/* Car Model */}
                <div className="floating-input">
                  <div className="relative">
                    <select
                      id="carModel"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className={errors.carModel ? 'border-red-500' : ''}
                    >
                      <option value="">Modelni tanlang</option>
                      {CAR_MODELS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="carModel">
                      Mashina modeli
                    </label>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.carModel && (
                    <p className="text-red-500 text-xs mt-1">{errors.carModel}</p>
                  )}
                </div>

                {/* Car Color */}
                <div className="floating-input">
                  <div className="relative">
                    <select
                      id="carColor"
                      value={carColor}
                      onChange={(e) => setCarColor(e.target.value)}
                      className={errors.carColor ? 'border-red-500' : ''}
                    >
                      <option value="">Rangni tanlang</option>
                      {CAR_COLORS.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="carColor">
                      Mashina rangi
                    </label>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.carColor && (
                    <p className="text-red-500 text-xs mt-1">{errors.carColor}</p>
                  )}
                </div>
              </>
            )}

            {errors.submit && (
              <p className="text-red-500 text-xs mt-2">{errors.submit}</p>
            )}
          </form>
        </div>

        <div className="border-t pt-4 mt-4 flex-shrink-0">
          <button
            type="submit"
            form="registration-form"
            id="register-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>

          <button
            type="button"
            id="register-cancel-btn"
            onClick={onClose}
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}
