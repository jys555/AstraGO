'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { RegistrationGuard } from '@/components/auth/RegistrationGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Chat } from '@/types';
import { formatDate } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default function ChatListPage() {
  const router = useRouter();
  
  const { data: currentUserData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => apiClient.getMyChats(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  
  // Use dateUtils for consistent formatting
  const formatDateLocal = (dateString: string) => {
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
      return formatDate(dateString);
    }
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return chat.messages[0].content;
    }
    return 'Xabar yo\'q';
  };

  // Separate chats into active and archived
  // Active chats: status is ACTIVE
  // Archived chats: status is ARCHIVED or READ_ONLY (these should always be shown in archive)
  const activeChats = data?.chats?.filter((chat: Chat) => chat.status === 'ACTIVE') || [];
  const archivedChats = data?.chats?.filter((chat: Chat) => 
    chat.status === 'ARCHIVED' || chat.status === 'READ_ONLY'
  ) || [];

  return (
    <RegistrationGuard>
      <div className="bg-gray-50 pb-20">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                Chatlar
              </h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Yuklanmoqda...</p>
            </div>
          ) : !data?.chats || data.chats.length === 0 ? (
            <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chatlar yo'q</h3>
                  <p className="text-gray-600 text-sm">Rezervatsiya qilganingizda chat avtomatik yaratiladi</p>
                </div>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="sticky top-[73px] z-40 bg-white pt-4 pb-2 -mt-6 mb-6 grid w-full max-w-md grid-cols-2 bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                  Faol ({activeChats.length})
                </TabsTrigger>
                <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-lg font-semibold">
                  Arxiv ({archivedChats.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {activeChats.length === 0 ? (
                  <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Faol chatlar yo'q</h3>
                        <p className="text-gray-600 text-sm">Rezervatsiya qilganingizda chat avtomatik yaratiladi</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  activeChats.map((chat: Chat) => {
                    const currentUserId = currentUserData?.user?.id;
                    const otherUser = chat.driver?.id === currentUserId 
                      ? chat.passenger 
                      : chat.driver;
                    
                    return (
                      <Card
                        key={chat.id}
                        onClick={() => router.push(`/chat/${chat.id}`)}
                        hover
                        className="p-4 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-semibold text-blue-700">
                              {otherUser?.firstName?.[0] || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser?.firstName} {otherUser?.lastName}
                              </h3>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatDateLocal(chat.messages?.[0]?.createdAt || chat.createdAt)}
                              </span>
                            </div>
                            {chat.trip && (
                              <p className="text-xs text-gray-500 mb-1">
                                {chat.trip.routeFrom} → {chat.trip.routeTo}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate flex-1">
                                {getLastMessage(chat)}
                              </p>
                              {(chat.unreadCount ?? 0) > 0 && (
                                <span className="ml-2 flex-shrink-0 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="archived" className="space-y-3">
                {archivedChats.length === 0 ? (
                  <Card className="p-12 text-center border border-gray-100 bg-white rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Arxivlangan chatlar yo'q</h3>
                        <p className="text-gray-600 text-sm">Yakunlangan chatlar shu yerda ko'rinadi</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  archivedChats.map((chat: Chat) => {
                    const currentUserId = currentUserData?.user?.id;
                    const otherUser = chat.driver?.id === currentUserId 
                      ? chat.passenger 
                      : chat.driver;
                    
                    return (
                      <Card
                        key={chat.id}
                        onClick={() => router.push(`/chat/${chat.id}`)}
                        hover
                        className="p-4 hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-2xl opacity-75"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-semibold text-gray-600">
                              {otherUser?.firstName?.[0] || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-700 truncate">
                                {otherUser?.firstName} {otherUser?.lastName}
                              </h3>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatDateLocal(chat.messages?.[0]?.createdAt || chat.createdAt)}
                              </span>
                            </div>
                            {chat.trip && (
                              <p className="text-xs text-gray-400 mb-1">
                                {chat.trip.routeFrom} → {chat.trip.routeTo}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate flex-1">
                                {getLastMessage(chat)}
                              </p>
                              {(chat.unreadCount ?? 0) > 0 && (
                                <span className="ml-2 flex-shrink-0 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </RegistrationGuard>
  );
}
