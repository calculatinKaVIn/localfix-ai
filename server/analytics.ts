import { getDb } from "./db";
import { problems, reports } from "../drizzle/schema";
import { sql, desc, eq } from "drizzle-orm";

/**
 * Analytics data structures
 */
export interface ProblemStats {
  totalProblems: number;
  submittedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  averageImpactScore: number;
}

export interface ClassificationStats {
  classification: string;
  count: number;
  percentage: number;
  averageImpactScore: number;
}

export interface PriorityStats {
  priority: string;
  count: number;
  percentage: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
  averageImpactScore: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  averageImpactScore: number;
}

export interface AnalyticsOverview {
  stats: ProblemStats;
  classificationBreakdown: ClassificationStats[];
  priorityBreakdown: PriorityStats[];
  departmentBreakdown: DepartmentStats[];
  topIssues: Array<{
    title: string;
    count: number;
    impactScore: number;
  }>;
  timeSeriesData: TimeSeriesData[];
}

/**
 * Get overall problem statistics
 */
export async function getProblemStats(): Promise<ProblemStats> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      totalProblems: sql<number>`COUNT(${problems.id})`,
      submittedCount: sql<number>`SUM(CASE WHEN ${problems.status} = 'submitted' THEN 1 ELSE 0 END)`,
      inProgressCount: sql<number>`SUM(CASE WHEN ${problems.status} = 'in_progress' THEN 1 ELSE 0 END)`,
      resolvedCount: sql<number>`SUM(CASE WHEN ${problems.status} = 'resolved' THEN 1 ELSE 0 END)`,
      rejectedCount: sql<number>`SUM(CASE WHEN ${problems.status} = 'rejected' THEN 1 ELSE 0 END)`,
      averageImpactScore: sql<number>`AVG(${reports.impactScore})`,
    })
    .from(problems)
    .leftJoin(reports, eq(problems.id, reports.problemId));

  const data = result[0] || {};

  return {
    totalProblems: data.totalProblems || 0,
    submittedCount: data.submittedCount || 0,
    inProgressCount: data.inProgressCount || 0,
    resolvedCount: data.resolvedCount || 0,
    rejectedCount: data.rejectedCount || 0,
    averageImpactScore: Math.round((data.averageImpactScore || 0) * 10) / 10,
  };
}

/**
 * Get problem classification breakdown
 */
export async function getClassificationStats(): Promise<ClassificationStats[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      classification: reports.classification,
      count: sql<number>`COUNT(${reports.id})`,
      averageImpactScore: sql<number>`AVG(${reports.impactScore})`,
    })
    .from(reports)
    .groupBy(reports.classification)
    .orderBy(desc(sql<number>`COUNT(${reports.id})`));

  const totalCount = result.reduce((sum, r) => sum + (r.count || 0), 0);

  return result.map((r) => ({
    classification: r.classification || "unknown",
    count: r.count || 0,
    percentage: totalCount > 0 ? Math.round(((r.count || 0) / totalCount) * 100) : 0,
    averageImpactScore: Math.round((r.averageImpactScore || 0) * 10) / 10,
  }));
}

/**
 * Get priority level breakdown
 */
export async function getPriorityStats(): Promise<PriorityStats[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      priority: reports.priority,
      count: sql<number>`COUNT(${reports.id})`,
    })
    .from(reports)
    .groupBy(reports.priority)
    .orderBy(desc(sql<number>`COUNT(${reports.id})`));

  const totalCount = result.reduce((sum, r) => sum + (r.count || 0), 0);

  return result.map((r) => ({
    priority: r.priority || "unknown",
    count: r.count || 0,
    percentage: totalCount > 0 ? Math.round(((r.count || 0) / totalCount) * 100) : 0,
  }));
}

/**
 * Get department breakdown
 */
export async function getDepartmentStats(): Promise<DepartmentStats[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      department: reports.department,
      count: sql<number>`COUNT(${reports.id})`,
      averageImpactScore: sql<number>`AVG(${reports.impactScore})`,
    })
    .from(reports)
    .groupBy(reports.department)
    .orderBy(desc(sql<number>`COUNT(${reports.id})`));

  return result.map((r) => ({
    department: r.department || "unknown",
    count: r.count || 0,
    averageImpactScore: Math.round((r.averageImpactScore || 0) * 10) / 10,
  }));
}

/**
 * Get top issues by frequency
 */
export async function getTopIssues(limit: number = 10): Promise<Array<{
  title: string;
  count: number;
  impactScore: number;
}>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      title: problems.title,
      count: sql<number>`COUNT(${problems.id})`,
      impactScore: sql<number>`AVG(${reports.impactScore})`,
    })
    .from(problems)
    .leftJoin(reports, eq(problems.id, reports.problemId))
    .groupBy(problems.title)
    .orderBy(desc(sql<number>`COUNT(${problems.id})`))
    .limit(limit);

  return result.map((r) => ({
    title: r.title || "unknown",
    count: r.count || 0,
    impactScore: Math.round((r.impactScore || 0) * 10) / 10,
  }));
}

/**
 * Get time series data for the last N days
 */
export async function getTimeSeriesData(days: number = 30): Promise<TimeSeriesData[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      date: sql<string>`DATE(${problems.createdAt})`,
      count: sql<number>`COUNT(${problems.id})`,
      averageImpactScore: sql<number>`AVG(${reports.impactScore})`,
    })
    .from(problems)
    .leftJoin(reports, eq(problems.id, reports.problemId))
    .where(
      sql`${problems.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
    )
    .groupBy(sql`DATE(${problems.createdAt})`)
    .orderBy(sql`DATE(${problems.createdAt})`);

  return result.map((r) => ({
    date: r.date || "",
    count: r.count || 0,
    averageImpactScore: Math.round((r.averageImpactScore || 0) * 10) / 10,
  }));
}

/**
 * Get comprehensive analytics overview
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [stats, classifications, priorities, departments, topIssues, timeSeries] =
    await Promise.all([
      getProblemStats(),
      getClassificationStats(),
      getPriorityStats(),
      getDepartmentStats(),
      getTopIssues(10),
      getTimeSeriesData(30),
    ]);

  return {
    stats,
    classificationBreakdown: classifications,
    priorityBreakdown: priorities,
    departmentBreakdown: departments,
    topIssues,
    timeSeriesData: timeSeries,
  };
}

/**
 * Detect community issue patterns
 */
export async function detectPatterns(): Promise<Array<{
  pattern: string;
  severity: "low" | "medium" | "high";
  description: string;
  affectedCount: number;
}>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const patterns: Array<{
    pattern: string;
    severity: "low" | "medium" | "high";
    description: string;
    affectedCount: number;
  }> = [];

  // Pattern 1: High-frequency problem types
  const classificationStats = await getClassificationStats();
  const topClassification = classificationStats[0];
  if (topClassification && topClassification.count > 5) {
    patterns.push({
      pattern: `High frequency of ${topClassification.classification} issues`,
      severity: topClassification.count > 10 ? "high" : "medium",
      description: `${topClassification.count} reports of ${topClassification.classification} detected in the community. This represents ${topClassification.percentage}% of all reports.`,
      affectedCount: topClassification.count,
    });
  }

  // Pattern 2: High-impact areas
  const stats = await getProblemStats();
  if (stats.averageImpactScore > 60) {
    patterns.push({
      pattern: "High-impact issues detected",
      severity: "high",
      description: `Average impact score is ${stats.averageImpactScore}/100, indicating significant community concerns.`,
      affectedCount: stats.totalProblems,
    });
  }

  // Pattern 3: Unresolved issues
  const unresolvedCount = stats.submittedCount + stats.inProgressCount;
  if (unresolvedCount > stats.resolvedCount) {
    patterns.push({
      pattern: "High volume of unresolved issues",
      severity: unresolvedCount > stats.resolvedCount * 2 ? "high" : "medium",
      description: `${unresolvedCount} issues are still pending resolution compared to ${stats.resolvedCount} resolved issues.`,
      affectedCount: unresolvedCount,
    });
  }

  // Pattern 4: Department workload imbalance
  const departments = await getDepartmentStats();
  if (departments.length > 1) {
    const maxCount = Math.max(...departments.map((d) => d.count));
    const minCount = Math.min(...departments.map((d) => d.count));
    if (maxCount > minCount * 3) {
      const overloaded = departments.find((d) => d.count === maxCount);
      patterns.push({
        pattern: `Workload imbalance: ${overloaded?.department} department`,
        severity: "medium",
        description: `The ${overloaded?.department} department has ${overloaded?.count} issues, significantly more than other departments.`,
        affectedCount: overloaded?.count || 0,
      });
    }
  }

  return patterns;
}
