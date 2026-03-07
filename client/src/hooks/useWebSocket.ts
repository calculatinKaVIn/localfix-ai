/**
 * WebSocket Hook for Real-time Problem Updates
 * 
 * Manages WebSocket connection and provides callbacks for problem updates
 */

import { useEffect, useRef, useCallback, useState } from "react";

export interface ProblemUpdate {
  type: "new_problem" | "problem_updated" | "problem_deleted";
  problem: {
    id: number;
    userId: number;
    title: string;
    description: string;
    imageUrl: string | null;
    latitude: string | null;
    longitude: string | null;
    status: "submitted" | "in_progress" | "resolved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
  };
  report: {
    id: number;
    problemId: number;
    classification: string;
    priority: string;
    department: string;
    subject: string;
    description: string;
    impactScore: number;
    riskLevel: string;
    affectedArea: string;
    suggestedUrgency: string;
  } | null;
}

interface UseWebSocketOptions {
  onProblemUpdate?: (update: ProblemUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onProblemUpdate,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setIsConnecting(true);
      const url = getWebSocketUrl();
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "connected") {
            console.log("[WebSocket] Server message:", data.message);
          } else if (data.type === "pong") {
            // Heartbeat response
          } else if (
            data.type === "new_problem" ||
            data.type === "problem_updated" ||
            data.type === "problem_deleted"
          ) {
            // Convert date strings to Date objects
            if (data.problem?.createdAt) {
              data.problem.createdAt = new Date(data.problem.createdAt);
            }
            if (data.problem?.updatedAt) {
              data.problem.updatedAt = new Date(data.problem.updatedAt);
            }
            onProblemUpdate?.(data as ProblemUpdate);
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      ws.onerror = (event) => {
        // Extract error details from event
        let errorMessage = "WebSocket connection failed";
        if (event instanceof Event) {
          errorMessage = `WebSocket error: ${event.type}`;
          if ((event as any).message) {
            errorMessage += ` - ${(event as any).message}`;
          }
        }
        console.error("[WebSocket] Error:", errorMessage);
        const error = new Error(errorMessage);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Attempt to reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(
            `[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (autoReconnect && reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn("[WebSocket] Max reconnection attempts reached, giving up");
          const error = new Error("WebSocket: Max reconnection attempts reached");
          onError?.(error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[WebSocket] Connection error:", errorMessage);
      const err = error instanceof Error ? error : new Error(errorMessage);
      onError?.(err);
      setIsConnecting(false);
    }
  }, [
    getWebSocketUrl,
    onConnect,
    onDisconnect,
    onError,
    onProblemUpdate,
    autoReconnect,
    reconnectDelay,
    maxReconnectAttempts,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send message to server
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] Not connected, cannot send message");
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    send,
    disconnect,
    reconnect: connect,
  };
}
