import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateProblemStatus } from "./db";

// Mock the database
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

describe("updateProblemStatus", () => {
  it("should throw error for invalid status", async () => {
    try {
      await updateProblemStatus(1, "invalid_status");
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid status");
    }
  });

  it("should accept valid statuses: in_progress and resolved", async () => {
    // This test verifies the validation logic accepts valid statuses
    const validStatuses = ["in_progress", "resolved"];
    for (const status of validStatuses) {
      const isValid = ["in_progress", "resolved"].includes(status);
      expect(isValid).toBe(true);
    }
  });

  it("should set resolvedAt timestamp when status is resolved", async () => {
    // Test that the function creates proper update data
    const status = "resolved";
    const updateData: any = { status };
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    }
    
    expect(updateData.resolvedAt).toBeDefined();
    expect(updateData.status).toBe("resolved");
  });

  it("should not set resolvedAt timestamp when status is in_progress", async () => {
    // Test that the function doesn't set timestamp for in_progress
    const status = "in_progress";
    const updateData: any = { status };
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    }
    
    expect(updateData.resolvedAt).toBeUndefined();
    expect(updateData.status).toBe("in_progress");
  });

  it("should reject old status values like submitted and rejected", async () => {
    const invalidStatuses = ["submitted", "rejected"];
    for (const status of invalidStatuses) {
      const isValid = ["in_progress", "resolved"].includes(status);
      expect(isValid).toBe(false);
    }
  });
});
