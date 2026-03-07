import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateEnhancedReport, validateProblemDescription } from "./aiEnhanced";
import { createProblem, createReport, getUserProblems, getAllProblems, getProblemWithReport, updateProblemStatus, deleteProblem, getAllProblemsForMap, getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { uploadProblemImage, validateImageFile } from "./imageUpload";
import { getAnalyticsOverview, detectPatterns } from "./analytics";
import wsManager from "./websocket";
import { aiAnalysisRouter } from "./routers/aiAnalysis";
import { translationRouter } from "./routers/translation";
import { photoReportingRouter } from "./routers/photoReporting";

export const appRouter = router({
  system: systemRouter,
  ai: aiAnalysisRouter,
  translation: translationRouter,
  photoReporting: photoReportingRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  problems: router({
    /**
     * Submit a new problem and generate AI report
     */
    /**
     * Upload image for a problem
     */
    uploadImage: protectedProcedure
      .input(
        z.object({
          imageData: z.string(),
          mimetype: z.string(),
          size: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const validation = validateImageFile({
            data: input.imageData,
            mimetype: input.mimetype,
            size: input.size,
          });

          if (!validation.valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: validation.error || "Invalid image",
            });
          }

          const imageUrl = await uploadProblemImage(
            ctx.user.id,
            input.imageData,
            input.mimetype
          );

          return { imageUrl, success: true };
        } catch (error) {
          console.error("Error uploading image:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image",
          });
        }
      }),

    submit: protectedProcedure
      .input(
        z.object({
          title: z.string().min(5),
          description: z.string().min(10),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const validation = validateProblemDescription(input.description);
          if (!validation.valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: validation.error,
            });
          }

          const problemData = {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            latitude: input.latitude || null,
            longitude: input.longitude || null,
            imageUrl: input.imageUrl || null,
            status: "submitted" as const,
          };

          const problem = await createProblem(problemData);

          const enhancedReport = await generateEnhancedReport(
            input.title,
            input.description
          );

          await createReport({
            problemId: problem.id,
            classification: enhancedReport.classification,
            priority: enhancedReport.priority,
            department: enhancedReport.department,
            subject: enhancedReport.subject,
            description: enhancedReport.description,
            riskLevel: enhancedReport.riskLevel,
            affectedArea: enhancedReport.affectedArea,
            suggestedUrgency: enhancedReport.suggestedUrgency,
            impactScore: enhancedReport.impactScore,
            safetyConsiderations: enhancedReport.safetyConsiderations,
            environmentalImpact: enhancedReport.environmentalImpact,
            affectedStakeholders: enhancedReport.affectedStakeholders,
            estimatedRepairCost: enhancedReport.estimatedRepairCost,
            recommendedSolution: enhancedReport.recommendedSolution,
            timelineEstimate: enhancedReport.timelineEstimate,
          });

          return {
            success: true,
            problemId: problem.id,
            report: enhancedReport,
          };
        } catch (error) {
          console.error("Error submitting problem:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit problem",
          });
        }
      }),

    myProblems: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserProblems(ctx.user.id);
      } catch (error) {
        console.error("Error fetching user problems:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch your problems",
        });
      }
    }),

    getProblem: protectedProcedure
      .input(z.object({ problemId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getProblemWithReport(input.problemId);
        } catch (error) {
          console.error("Error fetching problem:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch problem",
          });
        }
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          problemId: z.number(),
          status: z.enum(["submitted", "in_progress", "resolved", "rejected"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await updateProblemStatus(input.problemId, input.status);
          return { success: true };
        } catch (error) {
          console.error("Error updating problem status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update problem status",
          });
        }
      }),

    /**
     * Delete a problem (admin or problem owner)
     */
    deleteProblem: protectedProcedure
      .input(z.object({ problemId: z.number(), resolutionReason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Allow deletion if user is admin or problem owner
          // For now, allow any authenticated user to delete their own problems
          // In a production app, you'd verify problem ownership
          if (ctx.user.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have permission to delete this problem",
            });
          }

          await deleteProblem(input.problemId, input.resolutionReason);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error deleting problem:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete problem",
          });
        }
       }),
  }),

  map: router({
    allProblems: publicProcedure
      .input(z.object({
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          return await getAllProblemsForMap(input.status ? { status: input.status } : undefined);
        } catch (error) {
          console.error("Error fetching map problems:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch map problems",
          });
        }
      }),
  }),

  analytics: router({
    overview: publicProcedure.query(async () => {
      try {
        return await getAnalyticsOverview();
      } catch (error) {
        console.error("Error fetching analytics overview:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analytics",
        });
      }
    }),

    patterns: publicProcedure.query(async () => {
      try {
        return await detectPatterns();
      } catch (error) {
        console.error("Error detecting patterns:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detect patterns",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
