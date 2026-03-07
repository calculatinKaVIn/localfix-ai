/**
 * Photo Reporting Router
 * 
 * tRPC procedures for photo-based problem reporting with AI analysis
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  analyzeImageForIssues,
  generateDescriptionFromAnalysis,
  mapIssueTypeToClassification,
  mapSeverityToPriority,
  validateImageForAnalysis,
  extractImageMetadata,
  generateConfidenceSummary,
} from "../services/imageAnalysisService";
import { uploadProblemImage, validateImageFile } from "../imageUpload";

export const photoReportingRouter = router({
  /**
   * Analyze an image and generate issue detection
   */
  analyzeImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const analysis = await analyzeImageForIssues(input.imageUrl);
        const description = generateDescriptionFromAnalysis(analysis);
        const classification = mapIssueTypeToClassification(analysis.issueType);
        const priority = mapSeverityToPriority(analysis.severity);
        const confidenceSummary = generateConfidenceSummary(analysis.confidence);

        return {
          success: true,
          analysis,
          description,
          classification,
          priority,
          confidenceSummary,
        };
      } catch (error) {
        console.error("[PhotoReporting] Image analysis failed:", error);
        return {
          success: false,
          error: "Failed to analyze image",
        };
      }
    }),

  /**
   * Upload image and analyze it
   */
  uploadAndAnalyzeImage: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64
        mimetype: z.string(),
        size: z.number(),
        filename: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate image
        const validation = validateImageFile({
          data: input.imageData,
          mimetype: input.mimetype,
          size: input.size,
        });
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        // Upload image to S3
        const imageUrl = await uploadProblemImage(
          ctx.user.id,
          input.imageData,
          input.mimetype
        );

        // Analyze the uploaded image
        const analysis = await analyzeImageForIssues(imageUrl);
        const description = generateDescriptionFromAnalysis(analysis);
        const classification = mapIssueTypeToClassification(analysis.issueType);
        const priority = mapSeverityToPriority(analysis.severity);
        const confidenceSummary = generateConfidenceSummary(analysis.confidence);

        // Extract metadata
        const metadata = extractImageMetadata(
          input.filename || "uploaded_image",
          input.size,
          input.mimetype
        );

        return {
          success: true,
          imageUrl,
          analysis,
          description,
          classification,
          priority,
          confidenceSummary,
          metadata,
        };
      } catch (error) {
        console.error("[PhotoReporting] Upload and analysis failed:", error);
        return {
          success: false,
          error: "Failed to process image",
        };
      }
    }),

  /**
   * Get analysis result summary
   */
  getAnalysisSummary: protectedProcedure
    .input(
      z.object({
        issueType: z.string(),
        confidence: z.number(),
        severity: z.string(),
      })
    )
    .query(async ({ input }) => {
      return {
        classification: mapIssueTypeToClassification(input.issueType),
        priority: mapSeverityToPriority(input.severity),
        confidenceSummary: generateConfidenceSummary(input.confidence),
        isHighConfidence: input.confidence >= 75,
        isHighSeverity: input.severity === "high" || input.severity === "critical",
      };
    }),
});
