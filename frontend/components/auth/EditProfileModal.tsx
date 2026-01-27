'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
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

export function EditProfileModal({ isOpen, onClose, onSuccess, user }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [role, setRole] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
  const [carNumber, setCarNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasActiveSessions, setHasActiveSessions] = useState(false);
  const [isCheckingSessions, setIsCheckingSessions] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phonePlaceholderRef = useRef<HTMLSpanElement>(null);

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      
      // Format phone number
      if (user.phone) {
        let phoneDigits = user.phone.replace('+998', '').replace(/\s/g, '').replace(/[^0-9]/g, '');
        if (phoneDigits.length === 9) {
          // Format: 00 000 00 00
          const formatted = `${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 5)} ${phoneDigits.slice(5, 7)} ${phoneDigits.slice(7, 9)}`;
          setPhone(`+998 ${formatted}`);
        } else {
          setPhone(`+998 ${phoneDigits}`);
        }
      } else {
        setPhone('+998 ');
      }
      
      setRole(user.role || 'PASSENGER');
      setCarNumber(user.carNumber || '');
      setCarModel(user.carModel || '');
      setCarColor(user.carColor || '');
      setErrors({});
      
      // Check active sessions when modal opens
      checkActiveSessions();
    }
  }, [isOpen, user]);

  // Check active sessions when role changes
  useEffect(() => {
    if (isOpen && role !== user.role) {
      checkActiveSessions();
    }
  }, [role, isOpen, user.role]);

  const checkActiveSessions = async () => {
    setIsCheckingSessions(true);
    try {
      const hasActive = await apiClient.checkActiveSessions();
      setHasActiveSessions(hasActive);
    } catch (error) {
      console.error('Error checking active sessions:', error);
      setHasActiveSessions(false);
    } finally {
      setIsCheckingSessions(false);
    }
  };

  // Update phone placeholder position when focused
  useEffect(() => {
    if (focusedField === 'phone' && phoneInputRef.current && phonePlaceholderRef.current) {
      const input = phoneInputRef.current;
      const placeholder = phonePlaceholderRef.current;
      const wrapper = input.closest('.phone-input-wrapper');
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const inputRect = input.getBoundingClientRect();
        placeholder.style.left = `${inputRect.left - wrapperRect.left}px`;
      }
    }
  }, [focusedField]);

  // Format car number: 01 A 123 BC
  const handleCarNumberChange = (value: string) => {
    let cleaned = value.replace(/\s/g, '').toUpperCase();
    cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
    
    let formatted = '';
    if (cleaned.length > 0) {
      const region = cleaned.slice(0, 2).replace(/[^0-9]/g, '');
      if (region.length > 0) {
        formatted = region;
        if (cleaned.length > 2) {
          const firstLetter = cleaned.slice(2, 3).replace(/[^A-Z]/g, '');
          if (firstLetter) {
            formatted += ' ' + firstLetter;
            if (cleaned.length > 3) {
              const numbers = cleaned.slice(3, 6).replace(/[^0-9]/g, '');
              if (numbers.length > 0) {
                formatted += ' ' + numbers;
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
    
    const phoneDigits = phone.replace('+998 ', '').replace(/\s/g, '');
    if (!phoneDigits || phoneDigits.length < 9) {
      newErrors.phone = 'Telefon raqami to\'liq kiritilishi kerak';
    }
    
    if (role === 'DRIVER') {
      if (!carNumber || carNumber.length < 10) {
        newErrors.carNumber = 'Mashina raqami to\'liq kiritilishi kerak';
      }
      if (!carModel) {
        newErrors.carModel = 'Mashina modeli tanlanishi kerak';
      }
      if (!carColor) {
        newErrors.carColor = 'Mashina rangi tanlanishi kerak';
      }
    }
    
    // Check if role is being changed and user has active sessions
    if (role !== user.role && hasActiveSessions) {
      newErrors.role = 'Faol seanslar mavjud bo\'lganda rol o\'zgartirib bo\'lmaydi. Iltimos, avval barcha faol seanslarni yakunlang.';
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
      const phoneNumber = phone.replace(/\s/g, '');
      
      await apiClient.updateCurrentUser({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phoneNumber,
        role: role !== user.role ? role : undefined, // Only send role if changed
        carNumber: role === 'DRIVER' ? carNumber : undefined,
        carModel: role === 'DRIVER' ? carModel : undefined,
        carColor: role === 'DRIVER' ? carColor : undefined,
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Profilni yangilashda xatolik yuz berdi';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
      <div className="register-modal bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        <h3 className="flex-shrink-0">Profilingizni tahrirlash</h3>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={modalContentRef} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <form onSubmit={handleSubmit} id="edit-profile-form" className="pb-4">
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
              {focusedField === 'firstName' && !firstName && (
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
              {focusedField === 'lastName' && !lastName && (
                <span className="floating-placeholder">Familiyangizni kiriting</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="phone-floating-input">
              <div className={`phone-input-wrapper ${errors.phone ? 'border-red-500' : ''}`}>
                <span className="text-xl">🇺🇿</span>
                <span className="country-code">+998</span>
                <span className="divider">|</span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  id="phone"
                  value={phone.replace('+998 ', '')}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                    let formatted = '';
                    if (digits.length > 0) {
                      formatted = digits.slice(0, 2);
                    }
                    if (digits.length > 2) {
                      formatted += ' ' + digits.slice(2, 5);
                    }
                    if (digits.length > 5) {
                      formatted += ' ' + digits.slice(5, 7);
                    }
                    if (digits.length > 7) {
                      formatted += ' ' + digits.slice(7, 9);
                    }
                    setPhone('+998 ' + formatted);
                  }}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                />
                {focusedField === 'phone' && !phone.replace('+998 ', '').trim() && (
                  <span ref={phonePlaceholderRef} className="phone-placeholder">00 000 00 00</span>
                )}
              </div>
              <label htmlFor="phone">Telefon raqam</label>
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
                  onChange={(e) => setRole(e.target.value as 'PASSENGER' | 'DRIVER')}
                  disabled={hasActiveSessions && role !== user.role}
                  className={errors.role ? 'border-red-500' : ''}
                >
                  <option value="PASSENGER">Yo'lovchi</option>
                  <option value="DRIVER">Haydovchi</option>
                </select>
                <label htmlFor="role">Rol</label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {hasActiveSessions && role !== user.role && (
                <p className="text-red-500 text-xs mt-1">
                  Faol seanslar mavjud bo'lganda rol o'zgartirib bo'lmaydi
                </p>
              )}
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Driver-specific fields */}
            {role === 'DRIVER' && (
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
                  {focusedField === 'carNumber' && !carNumber && (
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
                    <label htmlFor="carModel">Mashina modeli</label>
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
                    <label htmlFor="carColor">Mashina rangi</label>
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

        <div className="flex-shrink-0" style={{ paddingTop: '8px', marginTop: '8px', width: '100%' }}>
          <div className="border-t" style={{ width: '100%', maxWidth: '100%', margin: '0 auto', borderColor: '#e0e0e0' }}></div>
          <button
            type="submit"
            form="edit-profile-form"
            id="register-submit-btn"
            disabled={isSubmitting || isCheckingSessions}
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
