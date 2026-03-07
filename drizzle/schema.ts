import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Problem classifications enum - types of urban infrastructure issues
 */
export const problemClassifications = [
  'pothole',
  'streetlight',
  'trash',
  'graffiti',
  'sidewalk',
  'water_damage',
  'vegetation',
  'other'
] as const;

export type ProblemClassification = (typeof problemClassifications)[number];

/**
 * Priority levels for problems
 */
export const priorityLevels = ['low', 'medium', 'high', 'critical'] as const;
export type PriorityLevel = (typeof priorityLevels)[number];

/**
 * Status of problem reports
 */
export const reportStatuses = ['submitted', 'in_progress', 'resolved', 'rejected'] as const;
export type ReportStatus = (typeof reportStatuses)[number];

/**
 * Problems table - stores user-reported issues
 */
export const problems = mysqlTable('problems', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: text('imageUrl'),
  latitude: varchar('latitude', { length: 50 }),
  longitude: varchar('longitude', { length: 50 }),
  status: mysqlEnum('status', reportStatuses).default('submitted').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;

/**
 * Reports table - stores AI-generated structured reports for problems
 */
export const reports = mysqlTable('reports', {
  id: int('id').autoincrement().primaryKey(),
  problemId: int('problemId').notNull().unique().references(() => problems.id, { onDelete: 'cascade' }),
  classification: mysqlEnum('classification', problemClassifications).notNull(),
  priority: mysqlEnum('priority', priorityLevels).notNull(),
  department: varchar('department', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  riskLevel: varchar('riskLevel', { length: 50 }).notNull(),
  affectedArea: varchar('affectedArea', { length: 255 }).notNull(),
  suggestedUrgency: varchar('suggestedUrgency', { length: 255 }).notNull(),
  impactScore: int('impactScore').notNull(),
  detailedAnalysis: text('detailedAnalysis'),
  safetyConsiderations: text('safetyConsiderations'),
  environmentalImpact: text('environmentalImpact'),
  affectedStakeholders: text('affectedStakeholders'),
  estimatedRepairCost: text('estimatedRepairCost'),
  recommendedSolution: text('recommendedSolution'),
  timelineEstimate: text('timelineEstimate'),
  relatedIssues: text('relatedIssues'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;