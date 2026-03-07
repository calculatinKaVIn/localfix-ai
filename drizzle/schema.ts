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
 * Reasons for problem resolution
 */
export const resolutionReasons = ['fixed', 'duplicate', 'invalid', 'no_action_needed', 'other'] as const;
export type ResolutionReason = (typeof resolutionReasons)[number];

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
  resolutionReason: mysqlEnum('resolutionReason', resolutionReasons),
  resolvedAt: timestamp('resolvedAt'),
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

/**
 * Image Analytics table - tracks image loading events and failures
 */
export const imageAnalytics = mysqlTable('imageAnalytics', {
  id: int('id').autoincrement().primaryKey(),
  problemId: int('problemId').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  userId: int('userId').references(() => users.id, { onDelete: 'set null' }),
  imageUrl: text('imageUrl').notNull(),
  
  // Event tracking
  eventType: mysqlEnum('eventType', ['load', 'error', 'retry', 'success', 'timeout']).notNull(),
  status: mysqlEnum('status', ['pending', 'loading', 'success', 'failed']).notNull(),
  
  // Error details
  errorCode: varchar('errorCode', { length: 50 }),
  errorMessage: text('errorMessage'),
  errorType: varchar('errorType', { length: 100 }), // 'cors', 'timeout', 'network', '404', 'server', 'unknown'
  
  // Retry information
  retryAttempt: int('retryAttempt').default(0),
  maxRetries: int('maxRetries').default(3),
  
  // Performance metrics
  loadTime: int('loadTime'), // milliseconds
  fileSize: int('fileSize'), // bytes
  contentType: varchar('contentType', { length: 100 }),
  
  // Browser/Network context
  userAgent: text('userAgent'),
  networkType: varchar('networkType', { length: 50 }), // '4g', '3g', '2g', 'wifi', 'unknown'
  bandwidth: int('bandwidth'), // estimated bandwidth in kbps
  
  // Request details
  httpStatus: int('httpStatus'),
  cacheControl: varchar('cacheControl', { length: 255 }),
  
  // Timestamps
  requestedAt: timestamp('requestedAt').defaultNow().notNull(),
  resolvedAt: timestamp('resolvedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type ImageAnalytic = typeof imageAnalytics.$inferSelect;
export type InsertImageAnalytic = typeof imageAnalytics.$inferInsert;


/**
 * Supported languages for multi-language reporting
 */
export const supportedLanguages = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
  'ru', // Russian
  'zh', // Chinese
  'ja', // Japanese
  'ko', // Korean
  'ar', // Arabic
  'hi', // Hindi
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

/**
 * Problem Translations table - stores translated versions of problem reports
 */
export const problemTranslations = mysqlTable('problemTranslations', {
  id: int('id').autoincrement().primaryKey(),
  problemId: int('problemId').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  
  // Original language
  originalLanguage: varchar('originalLanguage', { length: 10 }).notNull(),
  
  // Translated content
  language: varchar('language', { length: 10 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  // Translation metadata
  translatedBy: varchar('translatedBy', { length: 50 }).default('ai').notNull(), // 'ai' or 'human'
  confidence: int('confidence'), // 0-100 confidence score for AI translations
  isApproved: int('isApproved').default(0),
  approvedBy: int('approvedBy').references(() => users.id, { onDelete: 'set null' }),
  
  // Timestamps
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type ProblemTranslation = typeof problemTranslations.$inferSelect;
export type InsertProblemTranslation = typeof problemTranslations.$inferInsert;

/**
 * Update problems table to include language field
 */
export const problemsWithLanguage = mysqlTable('problems_v2', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: text('imageUrl'),
  latitude: varchar('latitude', { length: 50 }),
  longitude: varchar('longitude', { length: 50 }),
  status: mysqlEnum('status', reportStatuses).default('submitted').notNull(),
  
  // Language fields
  originalLanguage: varchar('originalLanguage', { length: 10 }).default('en').notNull(),
  detectedLanguage: varchar('detectedLanguage', { length: 10 }),
  
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
