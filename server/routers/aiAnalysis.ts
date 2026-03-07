/**
 * AI Analysis tRPC Router
 * 
 * Exposes AI analysis features via tRPC procedures
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  analyzeProblem,
  generateReportFormats,
  analyzeSafety,
  generateCityInsights,
  translateReport,
  summarizeReport,
  detectIncompleteReport,
} from "../services/aiAnalysis";
import {
  analyzeLocation,
  suggestLandmarks,
  estimateAffectedPopulation,
  predictTrafficImpact,
  detectHighAccidentArea,
} from "../services/locationIntelligence";
import {
  chatWithAssistant,
  askFollowUpQuestions,
  clarifyReport,
  suggestBetterWording,
  explainDepartmentResponsibility,
  provideLegalReferences,
  recommendCommunityResources,
} from "../services/aiChatbot";

export const aiAnalysisRouter = router({
  /**
   * Comprehensive problem analysis
   */
  analyzeProblem: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await analyzeProblem(
        input.title,
        input.description,
        input.latitude,
        input.longitude
      );
    }),

  /**
   * Generate multiple report formats
   */
  generateReportFormats: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        department: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await generateReportFormats(
        input.title,
        input.description,
        input.category,
        input.department
      );
    }),

  /**
   * Analyze safety aspects
   */
  analyzeSafety: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await analyzeSafety(input.title, input.description, input.category);
    }),

  /**
   * Generate city insights
   */
  generateCityInsights: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await generateCityInsights(
        input.title,
        input.description,
        input.category,
        input.latitude,
        input.longitude
      );
    }),

  /**
   * Translate report to multiple languages
   */
  translateReport: publicProcedure
    .input(
      z.object({
        text: z.string(),
        languages: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await translateReport(input.text, input.languages);
    }),

  /**
   * Summarize a report
   */
  summarizeReport: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      return await summarizeReport(input.text);
    }),

  /**
   * Detect incomplete reports
   */
  detectIncompleteReport: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await detectIncompleteReport(input.title, input.description);
    }),

  /**
   * Analyze location
   */
  analyzeLocation: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await analyzeLocation(input.latitude, input.longitude);
    }),

  /**
   * Suggest landmarks
   */
  suggestLandmarks: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await suggestLandmarks(
        input.latitude,
        input.longitude,
        input.description
      );
    }),

  /**
   * Estimate affected population
   */
  estimateAffectedPopulation: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
        category: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await estimateAffectedPopulation(
        input.latitude,
        input.longitude,
        input.category,
        input.description
      );
    }),

  /**
   * Predict traffic impact
   */
  predictTrafficImpact: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await predictTrafficImpact(
        input.latitude,
        input.longitude,
        input.category
      );
    }),

  /**
   * Detect high accident area
   */
  detectHighAccidentArea: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await detectHighAccidentArea(input.latitude, input.longitude);
    }),

  /**
   * Chat with AI assistant
   */
  chatWithAssistant: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        context: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            category: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await chatWithAssistant(input.messages, input.context);
    }),

  /**
   * Ask follow-up questions
   */
  askFollowUpQuestions: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await askFollowUpQuestions(
        input.title,
        input.description,
        input.category
      );
    }),

  /**
   * Clarify vague report
   */
  clarifyReport: publicProcedure
    .input(z.object({ vagueProblem: z.string() }))
    .mutation(async ({ input }) => {
      return await clarifyReport(input.vagueProblem);
    }),

  /**
   * Suggest better wording
   */
  suggestBetterWording: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      return await suggestBetterWording(input.text);
    }),

  /**
   * Explain department responsibility
   */
  explainDepartmentResponsibility: publicProcedure
    .input(
      z.object({
        category: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await explainDepartmentResponsibility(
        input.category,
        input.description
      );
    }),

  /**
   * Provide legal references
   */
  provideLegalReferences: publicProcedure
    .input(
      z.object({
        category: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await provideLegalReferences(input.category, input.description);
    }),

  /**
   * Recommend community resources
   */
  recommendCommunityResources: publicProcedure
    .input(
      z.object({
        category: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await recommendCommunityResources(
        input.category,
        input.description
      );
    }),
});
