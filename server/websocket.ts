/**
 * WebSocket Server Manager
 * 
 * Handles real-time updates for the live community map.
 * Broadcasts newly reported problems to all connected clients.
 */

import { WebSocketServer } from "ws";
import type { Server as HTTPServer } from "http";
import type { Server as HTTPSServer } from "https";

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

// Extend WebSocket to track alive status
declare global {
  namespace WebSocket {
    interface WebSocket {
      isAlive?: boolean;
    }
  }
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<any> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer | HTTPSServer) {
    this.wss = new WebSocketServer({ server, path: "/api/ws" });

    this.wss.on("connection", (ws: any) => {
      console.log(`[WebSocket] Client connected. Total clients: ${this.clients.size + 1}`);
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({ type: "connected", message: "Connected to live map" }));

      // Handle incoming messages
      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Total clients: ${this.clients.size}`);
      });

      // Handle errors
      ws.on("error", (error: any) => {
        console.error("[WebSocket] Client error:", error);
        this.clients.delete(ws);
      });

      // Respond to pings
      ws.on("pong", () => {
        ws.isAlive = true;
      });
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    console.log("[WebSocket] Server initialized");
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: any, message: any) {
    switch (message.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      case "subscribe":
        // Client is subscribing to updates
        ws.send(JSON.stringify({ type: "subscribed", message: "Subscribed to problem updates" }));
        break;
      default:
        console.log("[WebSocket] Unknown message type:", message.type);
    }
  }

  /**
   * Broadcast a problem update to all connected clients
   */
  broadcastProblemUpdate(update: ProblemUpdate) {
    if (!this.wss) {
      console.warn("[WebSocket] WebSocket server not initialized");
      return;
    }

    const message = JSON.stringify(update);
    let successCount = 0;
    let failureCount = 0;

    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message, (error: any) => {
          if (error) {
            console.error("[WebSocket] Error sending message:", error);
            failureCount++;
          } else {
            successCount++;
          }
        });
      }
    });

    console.log(
      `[WebSocket] Broadcast complete. Type: ${update.type}, Success: ${successCount}, Failure: ${failureCount}`
    );
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          console.log("[WebSocket] Terminating unresponsive connection");
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 45000); // 45 seconds - increased from 30s to give clients more time
  }

  /**
   * Stop the WebSocket server
   */
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close(() => {
        console.log("[WebSocket] Server stopped");
      });
    }

    this.clients.clear();
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

// Create singleton instance
const wsManager = new WebSocketManager();

export default wsManager;
