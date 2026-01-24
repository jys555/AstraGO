'use client';

import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketInitializerProps {
  userId: string | null;
}

export function WebSocketInitializer({ userId }: WebSocketInitializerProps) {
  // Initialize WebSocket connection - this hook uses useQueryClient which requires QueryClientProvider
  useWebSocket(userId);
  return null;
}
