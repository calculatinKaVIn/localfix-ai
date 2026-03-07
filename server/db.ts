import { count, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertReport, InsertProblem, problems, reports } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all problems with their reports and user info for the community map
 */
export async function getAllProblemsForMap(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const statusFilter = filters?.status && filters.status !== 'all' 
      ? eq(problems.status, filters.status as any)
      : undefined;

    const result = await db
      .select({
        problem: problems,
        report: reports,
        userName: users.name,
      })
      .from(problems)
      .leftJoin(reports, eq(reports.problemId, problems.id))
      .leftJoin(users, eq(users.id, problems.userId))
      .where(statusFilter)
      .orderBy(desc(problems.createdAt))
      .limit(filters?.limit || 10000)
      .offset(filters?.offset || 0);

    return result;
  } catch (error) {
    console.error("[Database] Error fetching problems for map:", error);
    return [];
  }
}

/**
 * Create a new problem
 */
export async function createProblem(data: InsertProblem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(problems).values(data);

  // Get the inserted problem by userId and title (most recent)
  const inserted = await db
    .select()
    .from(problems)
    .where(eq(problems.userId, data.userId!))
    .orderBy(desc(problems.createdAt))
    .limit(1);

  return inserted[0] || null;
}

/**
 * Get all problems for a user
 */
export async function getUserProblems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      problem: problems,
      report: reports,
    })
    .from(problems)
    .leftJoin(reports, eq(reports.problemId, problems.id))
    .where(eq(problems.userId, userId))
    .orderBy(desc(problems.createdAt));

  return result;
}

/**
 * Get all problems (paginated)
 */
export async function getAllProblems(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      problem: problems,
      report: reports,
    })
    .from(problems)
    .leftJoin(reports, eq(reports.problemId, problems.id))
    .orderBy(desc(problems.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Get a single problem with its report
 */
export async function getProblemWithReport(problemId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      problem: problems,
      report: reports,
    })
    .from(problems)
    .leftJoin(reports, eq(reports.problemId, problems.id))
    .where(eq(problems.id, problemId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a report for a problem
 */
export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(reports).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Error creating report:", error);
    throw error;
  }
}

/**
 * Update problem status
 */
export async function updateProblemStatus(problemId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(problems)
    .set({ status: status as any })
    .where(eq(problems.id, problemId));

  return result;
}

/**
 * Delete a problem and its report
 */
export async function deleteProblem(problemId: number, resolutionReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update problem with resolution reason and timestamp if provided
  if (resolutionReason) {
    await db.update(problems)
      .set({ resolutionReason: resolutionReason as any, resolvedAt: new Date() })
      .where(eq(problems.id, problemId));
  }

  // Delete report first (cascade will handle it, but explicit is safer)
  await db.delete(reports).where(eq(reports.problemId, problemId));

  // Delete problem
  const result = await db.delete(problems).where(eq(problems.id, problemId));

  return result;
}
