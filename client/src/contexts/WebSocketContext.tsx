/**
 * WebSocket Context
 * 
 * Provides global WebSocket connection state and reconnect functionality
 * accessible from anywhere in the app
 */

import React, { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  reconnect: () => void;
  lastConnectionError: string | null;
  connectionAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [lastConnectionError, setLastConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectCallbackRef = useRef<(() => void) | null>(null);

  const handleError = useCallback((error: Error) => {
    setLastConnectionError(error.message);
    setConnectionAttempts(prev => prev + 1);
  }, []);

  const handleConnect = useCallback(() => {
    setLastConnectionError(null);
    setConnectionAttempts(0);
  }, []);

  const { isConnected, isConnecting, reconnect: wsReconnect } = useWebSocket({
    onConnect: handleConnect,
    onError: handleError,
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
  });

  // Store reconnect callback for manual reconnection
  reconnectCallbackRef.current = wsReconnect;

  const handleManualReconnect = useCallback(() => {
    setLastConnectionError(null);
    setConnectionAttempts(0);
    if (reconnectCallbackRef.current) {
      reconnectCallbackRef.current();
    }
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    reconnect: handleManualReconnect,
    lastConnectionError,
    connectionAttempts,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access WebSocket context
 * Throws error if used outside WebSocketProvider
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
