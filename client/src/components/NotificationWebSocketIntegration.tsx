/**
 * Notification WebSocket Integration Component
 * 
 * This component integrates WebSocket updates with the notification badge system.
 * It's placed in the component tree after NotificationProvider so it can access
 * the notification context without circular dependencies.
 */

import { useEffect } from 'react';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';

export function NotificationWebSocketIntegration() {
  // Initialize WebSocket for real-time updates
  // This will automatically update badge counts when problems are created/updated
  const { isConnected } = useNotificationWebSocket({ enabled: true });

  useEffect(() => {
    if (isConnected) {
      console.log('[NotificationIntegration] WebSocket connected for real-time badge updates');
    }
  }, [isConnected]);

  // This component doesn't render anything, it just manages the WebSocket connection
  return null;
}
