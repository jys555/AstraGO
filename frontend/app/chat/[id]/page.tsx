'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, MapPin, Clock, Star, CheckCircle2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/dateUtils';
import { wsClient } from '@/lib/websocket';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { useReservation } from '@/hooks/useReservation';
import { Timer } from '@/components/ui/Timer';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const chatId = params.id as string;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  const currentUserIdValue = userData?.user?.id || null;

  useEffect(() => {
    if (currentUserIdValue) {
      wsClient.connect(currentUserIdValue);
    }
  }, [currentUserIdValue]);

  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ['chat-info', chatId],
    queryFn: () => apiClient.getChatById(chatId),
    enabled: !!chatId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: () => apiClient.getChatMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Get active reservation for this chat (only for passengers)
  // Always call useReservation hook (React hooks rules), but only use it if chat has reservation
  const { reservation, timeRemaining, driverResponded, confirmReservation, cancelReservation } = useReservation();

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => apiClient.sendMessage(chatId, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  // Subscribe to WebSocket for real-time messages
  useEffect(() => {
    if (!chatId || !currentUserIdValue) return;

    const handleNewMessage = (data: any) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        // If driver sends a message, invalidate reservation to update driverResponded
        if (chatData?.chat && chatData.chat.driverId === data.senderId && reservation && chatData.chat.reservationId === reservation.id) {
          queryClient.invalidateQueries({ queryKey: ['reservation', 'active'] });
        }
      }
    };

    wsClient.subscribeToChat(chatId, handleNewMessage);

    return () => {
      wsClient.unsubscribeFromChat(chatId);
    };
  }, [chatId, currentUserIdValue, queryClient, chatData, reservation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  // Prevent navbar from moving with keyboard using Telegram WebApp API
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      // Disable viewport auto-resize to prevent navbar from moving
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, []);

  // Mark messages as read when they're viewed (using Intersection Observer)
  useEffect(() => {
    if (!chatId || !currentUserIdValue || !messagesData?.messages) return;

    // Get unread messages (messages not sent by current user and not read)
    const unreadMessages = messagesData.messages.filter(
      (msg: ChatMessage) => msg.senderId !== currentUserIdValue && !msg.readAt
    );

    if (unreadMessages.length === 0) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Mark messages as read when they come into view
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleMessageIds = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target.getAttribute('data-message-id'))
            .filter((id): id is string => id !== null);

          if (visibleMessageIds.length > 0) {
            // Mark visible unread messages as read
            const unreadVisibleIds = visibleMessageIds.filter((id) => {
              const msg = messagesData.messages.find((m: ChatMessage) => m.id === id);
              return msg && msg.senderId !== currentUserIdValue && !msg.readAt;
            });

            if (unreadVisibleIds.length > 0) {
              apiClient.markChatAsRead(chatId, unreadVisibleIds).then(() => {
                queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
                queryClient.invalidateQueries({ queryKey: ['chats'] });
              }).catch(console.error);
            }
          }
        },
        {
          threshold: 0.5, // Message is considered visible when 50% is in view
        }
      );

      // Observe all unread messages
      unreadMessages.forEach((msg: ChatMessage) => {
        const element = document.querySelector(`[data-message-id="${msg.id}"]`);
        if (element) {
          observer.observe(element);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [chatId, currentUserIdValue, messagesData?.messages, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  // Use dateUtils for consistent formatting
  const formatTimeLocal = (dateString: string) => formatTime(dateString);
  
  const formatDateLocal = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return formatTimeLocal(dateString);
    } else {
      return formatDate(dateString) + ' ' + formatTimeLocal(dateString);
    }
  };

  if (chatLoading || messagesLoading) {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          <AppHeader />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Yuklanmoqda...</p>
          </div>
        </div>
      </RegistrationGuard>
    );
  }

  const messages = messagesData?.messages || [];
  const chat = chatData?.chat;
  
  if (!chat) {
    return (
      <RegistrationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          <AppHeader />
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-red-600">Chat topilmadi</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push('/chat')}
            >
              Chatlar ro'yxatiga qaytish
            </Button>
          </div>
        </div>
      </RegistrationGuard>
    );
  }

  const otherUser = chat.driver?.id === currentUserIdValue ? chat.passenger : chat.driver;
  const isDriver = chat.driver?.id === currentUserIdValue;
  
  // Check if reservation belongs to this chat
  const chatReservation = !isDriver && chat.reservationId && reservation && reservation.id === chat.reservationId ? reservation : null;
  const isReservationActive = chatReservation && chatReservation.status === 'PENDING' && timeRemaining !== null && timeRemaining > 0;
  const isReservationExpired = chatReservation && chatReservation.status === 'PENDING' && timeRemaining !== null && timeRemaining === 0;
  const isReadOnly = isReservationExpired || (chat.status === 'READ_ONLY') || (chat.status === 'ARCHIVED');
  
  // Check if driver has sent any messages (driver responded)
  // Driver is considered to have responded if they sent at least one message
  const driverHasMessaged = messages.some((msg: ChatMessage) => msg.senderId === chat.driverId);
  const effectiveDriverResponded = driverResponded || driverHasMessaged;

  const handleConfirm = async () => {
    if (!chatReservation) return;
    try {
      await confirmReservation(chatReservation.id);
      router.push('/my-trips');
    } catch (error) {
      console.error('Rezervatsiyani tasdiqlashda xatolik:', error);
      alert('Rezervatsiyani tasdiqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  const handleCancel = async () => {
    if (!chatReservation) return;
    try {
      await cancelReservation(chatReservation.id);
      router.push('/trips');
    } catch (error) {
      console.error('Rezervatsiyani bekor qilishda xatolik:', error);
      alert('Rezervatsiyani bekor qilishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  return (
    <RegistrationGuard>
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-1.5">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-50 -ml-2"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <Avatar className="h-12 w-12 border-2 border-gray-100">
                <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                  {otherUser?.firstName?.[0] || '?'}{otherUser?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                  {otherUser?.firstName} {otherUser?.lastName}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  {chat?.trip && (
                    <p className="text-sm text-gray-600 leading-tight">
                      {chat.trip.routeFrom} → {chat.trip.routeTo}
                    </p>
                  )}
                  {chat?.driver?.driverMetrics && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {chat.driver.driverMetrics.rankingScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {otherUser?.phone && (
                  <p className="text-sm text-gray-500 mt-0.5 leading-tight">{otherUser.phone}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Reservation Indicator */}
        {isReservationActive && timeRemaining !== null && (
          <div className="bg-primary-50 border-b border-primary-100 px-4 py-2 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-primary-900">Vaqtinchalik rezervatsiya faol</p>
                    <p className="text-xs text-primary-700">Kelishuvga erishish uchun vaqt qoldi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-primary-200">
                  <span className="text-lg font-bold text-primary-600">
                    {Math.floor(timeRemaining / 60000)}:{(Math.floor((timeRemaining % 60000) / 1000)).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isReservationExpired && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-medium text-gray-700 text-center">
                Kelishuvga erishilmadi. Chat faqat o'qish uchun.
              </p>
            </div>
          </div>
        )}


        {/* Messages */}
        <main className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain min-h-0 pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Hali xabarlar yo'q</p>
                <p className="text-gray-400 text-xs mt-1">Birinchi xabarni yuboring</p>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isOwn = msg.senderId === currentUserIdValue;
                return (
                  <div
                    key={msg.id}
                    data-message-id={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm
                        ${isOwn
                          ? 'bg-primary-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                        }
                      `}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        <p 
                          className={`
                            text-xs
                            ${isOwn ? 'text-primary-100' : 'text-gray-500'}
                          `}
                        >
                          {formatTimeLocal(msg.createdAt)}
                        </p>
                        {isOwn && (
                          <span className={`
                            flex items-center
                            ${msg.readAt ? 'text-primary-100' : 'text-primary-200'}
                          `}>
                            {msg.readAt ? (
                              // Double checkmark (read) - overlapping like Telegram, same size as single checkmark
                              <span className="relative inline-flex items-center" style={{ width: '20px', height: '16px' }}>
                                <svg 
                                  className="absolute left-0 top-0 w-4 h-4" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <svg 
                                  className="absolute right-0 top-0 w-4 h-4" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              // Single checkmark (sent)
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Actions - Only show for passengers with active reservation */}
        {!isDriver && isReservationActive && chatReservation && (
          <div className="border-t border-gray-100 bg-white px-4 py-2 flex-shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <Button
                onClick={handleConfirm}
                disabled={!effectiveDriverResponded}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Kelishuvni Tasdiqlash
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 font-semibold py-3 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Bekor Qilish va Boshqa Safarni Tanlash
              </Button>
            </div>
          </div>
        )}

        {/* Input Area - Show for both drivers and passengers (unless read-only) */}
        {!isReadOnly && (
          <footer className="fixed bottom-[56px] left-0 right-0 border-t border-gray-100 bg-white z-30 safe-area-bottom">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0 h-10 w-10 border-gray-200 hover:bg-gray-50 rounded-xl"
                >
                  <MapPin className="h-4 w-4 text-gray-600" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Xabar yozing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    className="h-10 pr-12 border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl text-sm"
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  isLoading={sendMessageMutation.isPending}
                  className="flex-shrink-0 h-10 w-10 bg-primary-500 hover:bg-primary-600 text-white p-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </footer>
        )}
      </div>
    </RegistrationGuard>
  );
}
