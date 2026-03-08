/**
 * Notification WebSocket Hook
 * 
 * Integrates WebSocket updates with the notification badge system.
 * Listens for new problems, updates, and deletions, then updates badge counts accordingly.
 */

import { useEffect, useCallback } from 'react';
import { useWebSocket, ProblemUpdate } from './useWebSocket';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/_core/hooks/useAuth';

interface UseNotificationWebSocketOptions {
  enabled?: boolean;
}

export function useNotificationWebSocket(options: UseNotificationWebSocketOptions = {}) {
  const { enabled = true } = options;
  const { incrementNewReports, decrementNewReports, incrementMyReports, decrementMyReports } = useNotifications();
  const { user } = useAuth();

  // Handle problem updates from WebSocket
  const handleProblemUpdate = useCallback((update: ProblemUpdate) => {
    if (!user) return;

    // Check if this problem belongs to the current user
    const isUsersProblem = update.problem.userId === user.id;

    switch (update.type) {
      case 'new_problem': {
        // Increment new reports badge for all users
        incrementNewReports();
        
        // Also increment user's own reports if it's their problem
        if (isUsersProblem) {
          incrementMyReports();
        }
        break;
      }

      case 'problem_updated': {
        // When a problem status changes, update badges accordingly
        // If problem moves to resolved/rejected, decrement badges
        if (update.problem.status === 'resolved' || update.problem.status === 'rejected') {
          // Decrement new reports since it's no longer in progress
          decrementNewReports();
          
          // Decrement user's reports if it's their problem
          if (isUsersProblem) {
            decrementMyReports();
          }
        }
        break;
      }

      case 'problem_deleted': {
        // When a problem is deleted, decrement badges
        decrementNewReports();
        
        if (isUsersProblem) {
          decrementMyReports();
        }
        break;
      }
    }
  }, [user, incrementNewReports, decrementNewReports, incrementMyReports, decrementMyReports]);

  // Set up WebSocket connection
  const { isConnected } = useWebSocket({
    onProblemUpdate: enabled ? handleProblemUpdate : undefined,
    onConnect: () => {
      console.log('[NotificationWebSocket] Connected to real-time updates');
    },
    onDisconnect: () => {
      console.log('[NotificationWebSocket] Disconnected from real-time updates');
    },
    onError: (error) => {
      console.error('[NotificationWebSocket] Error:', error.message);
    },
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
  });

  return {
    isConnected,
  };
}
