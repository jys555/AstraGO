'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col container mx-auto px-4">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 py-3 px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                ←
              </Button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-blue-600">
                  {otherUser?.firstName?.[0] || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {otherUser?.firstName} {otherUser?.lastName}
                </h2>
                {chat?.trip && (
                  <p className="text-xs text-gray-500 truncate">
                    {chat.trip.routeFrom} → {chat.trip.routeTo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
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

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Xabar yozing..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!message.trim() || sendMessageMutation.isPending}
                isLoading={sendMessageMutation.isPending}
              >
                Yuborish
              </Button>
            </form>
          </div>
        </main>
      </div>
    </RegistrationGuard>
  );
}
