'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, MapPin, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const chatId = params.id as string;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });

  useEffect(() => {
    if (userData?.user?.id) {
      setCurrentUserId(userData.user.id);
      wsClient.connect(userData.user.id);
    }
  }, [userData]);

  const { data: chatData } = useQuery({
    queryKey: ['chat-info', chatId],
    queryFn: () => apiClient.getChatById(chatId),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: () => apiClient.getChatMessages(chatId),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

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
    if (!chatId) return;

    const handleNewMessage = (data: any) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    };

    wsClient.subscribeToChat(chatId, handleNewMessage);

    return () => {
      wsClient.unsubscribeFromChat(chatId);
    };
  }, [chatId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return formatTime(dateString);
    } else {
      return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }) + ' ' + formatTime(dateString);
    }
  };

  if (messagesLoading) {
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
  const otherUser = chat?.driver?.id === currentUserId ? chat?.passenger : chat?.driver;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <RegistrationGuard>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {otherUser?.firstName?.[0] || '?'}{otherUser?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {otherUser?.firstName} {otherUser?.lastName}
                  </h1>
                  {chat?.trip && (
                    <p className="text-sm text-gray-500">
                      {chat.trip.routeFrom} → {chat.trip.routeTo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Hali xabarlar yo'q</p>
                <p className="text-gray-400 text-xs mt-1">Birinchi xabarni yuboring</p>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
                        ${isOwn
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }
                      `}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p 
                        className={`
                          text-xs mt-2
                          ${isOwn ? 'text-blue-100' : 'text-gray-500'}
                        `}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-end gap-3">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 h-11 w-11 border-gray-300 hover:bg-gray-50"
              >
                <MapPin className="h-5 w-5 text-gray-600" />
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
                  className="pr-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
                />
              </div>
              <Button
                onClick={(e) => handleSend(e)}
                disabled={!message.trim() || sendMessageMutation.isPending}
                isLoading={sendMessageMutation.isPending}
                className="flex-shrink-0 h-11 w-11 bg-blue-500 hover:bg-blue-600 text-white p-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </RegistrationGuard>
  );
}
