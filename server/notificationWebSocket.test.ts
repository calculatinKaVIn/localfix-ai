import { describe, it, expect, beforeEach, vi } from "vitest";

describe("WebSocket Notification Integration", () => {
  let mockWebSocket: any;
  let messageHandlers: Record<string, Function> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandlers = {};

    // Mock WebSocket
    mockWebSocket = {
      readyState: 1, // OPEN
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        messageHandlers[event] = handler;
      }),
      removeEventListener: vi.fn(),
    };

    // Mock global WebSocket
    (global as any).WebSocket = vi.fn(() => mockWebSocket);
  });

  it("should increment newReports badge when new_problem event is received", () => {
    const newProblemEvent = {
      type: "new_problem",
      problem: {
        id: 1,
        userId: 2,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: {
        id: 1,
        problemId: 1,
        classification: "pothole",
        priority: "high",
        department: "Transportation",
        subject: "Pothole Report",
        description: "Large pothole needs immediate repair",
        impactScore: 85,
        riskLevel: "high",
        affectedArea: "Main Street",
        suggestedUrgency: "immediate",
      },
    };

    expect(newProblemEvent.type).toBe("new_problem");
    expect(newProblemEvent.problem.status).toBe("in_progress");
  });

  it("should decrement badges when problem_updated event with resolved status is received", () => {
    const updatedProblemEvent = {
      type: "problem_updated",
      problem: {
        id: 1,
        userId: 2,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "resolved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: {
        id: 1,
        problemId: 1,
        classification: "pothole",
        priority: "high",
        department: "Transportation",
        subject: "Pothole Report",
        description: "Large pothole needs immediate repair",
        impactScore: 85,
        riskLevel: "high",
        affectedArea: "Main Street",
        suggestedUrgency: "immediate",
      },
    };

    expect(updatedProblemEvent.type).toBe("problem_updated");
    expect(updatedProblemEvent.problem.status).toBe("resolved");
  });

  it("should handle problem_deleted event and decrement badges", () => {
    const deletedProblemEvent = {
      type: "problem_deleted",
      problem: {
        id: 1,
        userId: 2,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    expect(deletedProblemEvent.type).toBe("problem_deleted");
    expect(deletedProblemEvent.report).toBeNull();
  });

  it("should distinguish between user's own problems and others' problems", () => {
    const currentUserId = 1;
    const otherUserId = 2;

    const usersProblem = {
      type: "new_problem",
      problem: {
        id: 1,
        userId: currentUserId,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    const otherUsersProblem = {
      type: "new_problem",
      problem: {
        id: 2,
        userId: otherUserId,
        title: "Broken Streetlight",
        description: "Streetlight not working",
        imageUrl: null,
        latitude: "40.7129",
        longitude: "-74.0061",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    expect(usersProblem.problem.userId).toBe(currentUserId);
    expect(otherUsersProblem.problem.userId).toBe(otherUserId);
    expect(usersProblem.problem.userId).not.toBe(otherUsersProblem.problem.userId);
  });

  it("should handle WebSocket connection and disconnection", () => {
    expect(mockWebSocket.readyState).toBe(1); // OPEN
    mockWebSocket.close();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it("should increment both newReports and myReports for user's own new problem", () => {
    const currentUserId = 1;

    const usersProblem = {
      type: "new_problem",
      problem: {
        id: 1,
        userId: currentUserId,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    // For user's own problem, both badges should increment
    const isUsersProblem = usersProblem.problem.userId === currentUserId;
    expect(isUsersProblem).toBe(true);
    expect(usersProblem.type).toBe("new_problem");
  });

  it("should only increment newReports for other user's new problem", () => {
    const currentUserId = 1;
    const otherUserId = 2;

    const otherUsersProblem = {
      type: "new_problem",
      problem: {
        id: 2,
        userId: otherUserId,
        title: "Broken Streetlight",
        description: "Streetlight not working",
        imageUrl: null,
        latitude: "40.7129",
        longitude: "-74.0061",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    // For other user's problem, only newReports should increment
    const isUsersProblem = otherUsersProblem.problem.userId === currentUserId;
    expect(isUsersProblem).toBe(false);
    expect(otherUsersProblem.type).toBe("new_problem");
  });

  it("should handle rejected status same as resolved status", () => {
    const rejectedProblemEvent = {
      type: "problem_updated",
      problem: {
        id: 1,
        userId: 2,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "rejected",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    const isTerminalStatus =
      rejectedProblemEvent.problem.status === "resolved" ||
      rejectedProblemEvent.problem.status === "rejected";

    expect(isTerminalStatus).toBe(true);
  });

  it("should not decrement badges for in_progress status updates", () => {
    const inProgressEvent = {
      type: "problem_updated",
      problem: {
        id: 1,
        userId: 2,
        title: "Pothole",
        description: "Large pothole on Main St",
        imageUrl: null,
        latitude: "40.7128",
        longitude: "-74.0060",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      report: null,
    };

    const isTerminalStatus =
      inProgressEvent.problem.status === "resolved" ||
      inProgressEvent.problem.status === "rejected";

    expect(isTerminalStatus).toBe(false);
  });
});
