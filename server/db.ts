import { count, desc, eq } from "drizzle-orm";
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
 * Get all problems with their reports for a specific user
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
 * Get all problems with pagination (for admin dashboard)
 */
export async function getAllProblems(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return { problems: [], total: 0 };

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

  // Get total count
  const countResult = await db.select({ count: count() }).from(problems);
  const total = countResult[0]?.count || 0;

  return { problems: result, total };
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
 * Create a new problem
 */
export async function createProblem(data: InsertProblem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(problems).values(data);
  
  // Fetch the last inserted problem
  const inserted = await db
    .select()
    .from(problems)
    .where(eq(problems.userId, data.userId))
    .orderBy((p) => p.id)
    .limit(1);
  
  if (inserted.length === 0) {
    throw new Error("Failed to retrieve inserted problem");
  }
  
  return inserted[0];
}

/**
 * Create a new report for a problem
 */
export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values(data);
  return result;
}

/**
 * Update problem status
 */
export async function updateProblemStatus(problemId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(problems)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(problems.id, problemId));

  return result;
}

/**
 * Delete a problem and its associated report
 */
export async function deleteProblem(problemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Reports will be deleted automatically due to cascade delete
  const result = await db.delete(problems).where(eq(problems.id, problemId));
  return result;
}

