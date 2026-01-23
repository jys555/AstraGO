import { useEffect, useRef } from 'react';
import { wsClient } from '@/lib/websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket(userId: string | null) {
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!userId || connectedRef.current) return;

    wsClient.connect(userId);
    connectedRef.current = true;

    // Listen for driver status changes
    const handleDriverStatusChange = (data: { driverId: string; onlineStatus: boolean }) => {
      // Invalidate trips query to refresh driver status
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    };

    wsClient.onDriverStatusChanged(handleDriverStatusChange);

    return () => {
      wsClient.offDriverStatusChanged(handleDriverStatusChange);
      wsClient.disconnect();
      connectedRef.current = false;
    };
  }, [userId, queryClient]);
}
