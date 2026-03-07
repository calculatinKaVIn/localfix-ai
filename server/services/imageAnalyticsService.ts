/**
 * Image Analytics Service
 * 
 * Tracks image loading events, failures, and performance metrics
 * Provides insights into image delivery reliability and optimization opportunities
 */

import { getDb } from "../db";
import { imageAnalytics } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface ImageLoadEvent {
  problemId: number;
  userId?: number;
  imageUrl: string;
  eventType: "load" | "error" | "retry" | "success" | "timeout";
  status: "pending" | "loading" | "success" | "failed";
  errorCode?: string;
  errorMessage?: string;
  errorType?: "cors" | "timeout" | "network" | "404" | "server" | "unknown";
  retryAttempt?: number;
  maxRetries?: number;
  loadTime?: number;
  fileSize?: number;
  contentType?: string;
  userAgent?: string;
  networkType?: string;
  bandwidth?: number;
  httpStatus?: number;
  cacheControl?: string;
}

export interface ImageAnalyticsStats {
  totalEvents: number;
  successRate: number;
  failureRate: number;
  averageLoadTime: number;
  commonErrors: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  networkTypeBreakdown: Record<string, number>;
  retryStats: {
    totalRetries: number;
    successAfterRetry: number;
    failedAfterRetry: number;
  };
}

/**
 * Record an image loading event
 */
export async function recordImageLoadEvent(event: ImageLoadEvent): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(imageAnalytics).values({
      problemId: event.problemId,
      userId: event.userId,
      imageUrl: event.imageUrl,
      eventType: event.eventType,
      status: event.status,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      errorType: event.errorType,
      retryAttempt: event.retryAttempt ?? 0,
      maxRetries: event.maxRetries ?? 3,
      loadTime: event.loadTime,
      fileSize: event.fileSize,
      contentType: event.contentType,
      userAgent: event.userAgent,
      networkType: event.networkType,
      bandwidth: event.bandwidth,
      httpStatus: event.httpStatus,
      cacheControl: event.cacheControl,
      requestedAt: new Date(),
      resolvedAt: event.status === "success" || event.status === "failed" ? new Date() : null,
    });
  } catch (error) {
    console.error("[ImageAnalytics] Failed to record event:", error);
  }
}

/**
 * Get analytics for a specific problem's image
 */
export async function getImageAnalytics(problemId: number): Promise<ImageAnalyticsStats | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const events = await db
      .select()
      .from(imageAnalytics)
      .where(eq(imageAnalytics.problemId, problemId));

    if (events.length === 0) {
      return null;
    }

    const successEvents = events.filter((e: any) => e.status === "success");
    const failedEvents = events.filter((e: any) => e.status === "failed");
    const retryEvents = events.filter((e: any) => e.eventType === "retry");

    const loadTimes = events
      .filter((e: any) => e.loadTime !== null && e.loadTime !== undefined)
      .map((e) => e.loadTime as number);
    const averageLoadTime =
      loadTimes.length > 0 ? Math.round(loadTimes.reduce((a: any, b: any) => a + b, 0) / loadTimes.length) : 0;

    const errorCounts: Record<string, number> = {};
    failedEvents.forEach((e: any) => {
      const errorType = e.errorType || "unknown";
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: Math.round((count / failedEvents.length) * 100),
      }))
      .sort((a: any, b: any) => b.count - a.count);

    const networkCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      if (e.networkType) {
        networkCounts[e.networkType] = (networkCounts[e.networkType] || 0) + 1;
      }
    });

    return {
      totalEvents: events.length,
      successRate: Math.round((successEvents.length / events.length) * 100),
      failureRate: Math.round((failedEvents.length / events.length) * 100),
      averageLoadTime,
      commonErrors,
      networkTypeBreakdown: networkCounts,
      retryStats: {
        totalRetries: retryEvents.length,
        successAfterRetry: retryEvents.filter((e: any) => e.status === "success").length,
        failedAfterRetry: retryEvents.filter((e: any) => e.status === "failed").length,
      },
    };
  } catch (error) {
    console.error("[ImageAnalytics] Failed to get analytics:", error);
    return null;
  }
}

/**
 * Get global image analytics across all problems
 */
export async function getGlobalImageAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<ImageAnalyticsStats | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    let events = await db.select().from(imageAnalytics);

    if (startDate || endDate) {
      const conditions: any[] = [];
      if (startDate) {
        conditions.push(gte(imageAnalytics.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(imageAnalytics.createdAt, endDate));
      }
      if (conditions.length > 0) {
        events = await db
          .select()
          .from(imageAnalytics)
          .where(and(...conditions));
      }
    }

    if (events.length === 0) {
      return null;
    }

    const successEvents = events.filter((e: any) => e.status === "success");
    const failedEvents = events.filter((e: any) => e.status === "failed");
    const retryEvents = events.filter((e: any) => e.eventType === "retry");

    const loadTimes = events
      .filter((e: any) => e.loadTime !== null && e.loadTime !== undefined)
      .map((e) => e.loadTime as number);
    const averageLoadTime =
      loadTimes.length > 0 ? Math.round(loadTimes.reduce((a: any, b: any) => a + b, 0) / loadTimes.length) : 0;

    const errorCounts: Record<string, number> = {};
    failedEvents.forEach((e: any) => {
      const errorType = e.errorType || "unknown";
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: Math.round((count / failedEvents.length) * 100),
      }))
      .sort((a: any, b: any) => b.count - a.count);

    const networkCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      if (e.networkType) {
        networkCounts[e.networkType] = (networkCounts[e.networkType] || 0) + 1;
      }
    });

    return {
      totalEvents: events.length,
      successRate: Math.round((successEvents.length / events.length) * 100),
      failureRate: Math.round((failedEvents.length / events.length) * 100),
      averageLoadTime,
      commonErrors,
      networkTypeBreakdown: networkCounts,
      retryStats: {
        totalRetries: retryEvents.length,
        successAfterRetry: retryEvents.filter((e: any) => e.status === "success").length,
        failedAfterRetry: retryEvents.filter((e: any) => e.status === "failed").length,
      },
    };
  } catch (error) {
    console.error("[ImageAnalytics] Failed to get global analytics:", error);
    return null;
  }
}

/**
 * Get detailed event history for a problem
 */
export async function getImageEventHistory(problemId: number, limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(imageAnalytics)
      .where(eq(imageAnalytics.problemId, problemId))
      .orderBy(desc(imageAnalytics.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[ImageAnalytics] Failed to get event history:", error);
    return [];
  }
}

/**
 * Get problems with highest failure rates
 */
export async function getProblemsWithHighestFailureRates(limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];
    const events = await db.select().from(imageAnalytics);

    const problemStats: Record<
      number,
      { total: number; failed: number; failureRate: number; imageUrl: string }
    > = {};

    events.forEach((event: any) => {
      if (!problemStats[event.problemId]) {
        problemStats[event.problemId] = {
          total: 0,
          failed: 0,
          failureRate: 0,
          imageUrl: event.imageUrl || "",
        };
      }

      problemStats[event.problemId].total++;
      if (event.status === "failed") {
        problemStats[event.problemId].failed++;
      }
    });

    const sorted = Object.entries(problemStats)
      .map(([problemId, stats]) => ({
        problemId: parseInt(problemId),
        failureRate: Math.round((stats.failed / stats.total) * 100),
        totalEvents: stats.total,
        failedEvents: stats.failed,
        imageUrl: stats.imageUrl,
      }))
      .sort((a: any, b: any) => b.failureRate - a.failureRate)
      .slice(0, limit);

    return sorted;
  } catch (error) {
    console.error("[ImageAnalytics] Failed to get problems with highest failure rates:", error);
    return [];
  }
}

/**
 * Get error distribution across all images
 */
export async function getErrorDistribution() {
  try {
    const db = await getDb();
    if (!db) return [];
    const failedEvents = await db
      .select()
      .from(imageAnalytics)
      .where(eq(imageAnalytics.status, "failed"));

    const errorDistribution: Record<string, number> = {};
    failedEvents.forEach((event: any) => {
      const errorType = event.errorType || "unknown";
      errorDistribution[errorType] = (errorDistribution[errorType] || 0) + 1;
    });

    return Object.entries(errorDistribution)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: Math.round((count / failedEvents.length) * 100),
      }))
      .sort((a: any, b: any) => b.count - a.count);
  } catch (error) {
    console.error("[ImageAnalytics] Failed to get error distribution:", error);
    return [];
  }
}
