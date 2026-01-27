'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { Chat } from '@/types';

export const dynamic = 'force-dynamic';

export default function ChatListPage() {
  const router = useRouter();
  
  const { data, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => apiClient.getMyChats(),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Bugun';
    } else if (days === 1) {
      return 'Kecha';
    } else if (days < 7) {
      return `${days} kun oldin`;
    } else {
      return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return chat.messages[0].content;
    }
    return 'Xabar yo\'q';
  };

  return (
    <RegistrationGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <AppHeader />
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Chatlar</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Yuklanmoqda...</p>
            </div>
          ) : !data?.chats || data.chats.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Hali chatlar yo'q</p>
                <p className="text-gray-500 text-sm">
                  Rezervatsiya qilganingizda chat avtomatik yaratiladi
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.chats.map((chat: Chat) => {
                const currentUserId = currentUserData?.user?.id;
                const otherUser = chat.driver?.id === currentUserId 
                  ? chat.passenger 
                  : chat.driver;
                
                return (
                  <Card
                    key={chat.id}
                    onClick={() => router.push(`/chat/${chat.id}`)}
                    hover
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {otherUser?.firstName?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.firstName} {otherUser?.lastName}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDate(chat.messages?.[0]?.createdAt || chat.createdAt)}
                          </span>
                        </div>
                        {chat.trip && (
                          <p className="text-xs text-gray-500 mb-1">
                            {chat.trip.routeFrom} → {chat.trip.routeTo}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 truncate">
                          {getLastMessage(chat)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </RegistrationGuard>
  );
}
