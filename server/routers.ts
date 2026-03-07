import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateEnhancedReport, validateProblemDescription } from "./aiEnhanced";
import { createProblem, createReport, getUserProblems, getAllProblems, getProblemWithReport, updateProblemStatus, deleteProblem, getAllProblemsForMap } from "./db";
import { TRPCError } from "@trpc/server";
import { uploadProblemImage, validateImageFile } from "./imageUpload";
import { getAnalyticsOverview, detectPatterns } from "./analytics";
import wsManager from "./websocket";

export const appRouter = router({
  system: systemRouter,
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
          description: z.string().min(10).max(2000),
          imageUrl: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Validate input
          const validation = validateProblemDescription(input.description);
          if (!validation.valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: validation.error || "Invalid description",
            });
          }

          // Generate enhanced AI report with comprehensive analysis
          const report = await generateEnhancedReport(input.description, input.imageUrl);

          // Create problem record
          const problemResult = await createProblem({
            userId: ctx.user.id,
            title: report.subject,
            description: input.description,
            imageUrl: input.imageUrl,
            status: "submitted",
            latitude: input.latitude ? input.latitude.toString() : undefined,
            longitude: input.longitude ? input.longitude.toString() : undefined,
          });

          const problemId = problemResult.id;

          // Create report record with enhanced fields
          await createReport({
            problemId,
            classification: report.classification,
            priority: report.priority,
            department: report.department,
            subject: report.subject,
            description: report.description,
            riskLevel: report.riskLevel,
            affectedArea: report.affectedArea,
            suggestedUrgency: report.suggestedUrgency,
            impactScore: report.impactScore,
            detailedAnalysis: report.detailedAnalysis,
            safetyConsiderations: report.safetyConsiderations,
            environmentalImpact: report.environmentalImpact,
            affectedStakeholders: report.affectedStakeholders,
            estimatedRepairCost: report.estimatedRepairCost,
            recommendedSolution: report.recommendedSolution,
            timelineEstimate: report.timelineEstimate,
            relatedIssues: JSON.stringify(report.relatedIssues),
          });

          // Fetch the complete problem with report for broadcast
          const problemWithReport = await getProblemWithReport(problemId);
          
          // Broadcast to all connected clients
          if (problemWithReport) {
            wsManager.broadcastProblemUpdate({
              type: "new_problem",
              problem: problemWithReport.problem,
              report: problemWithReport.report,
            });
          }

          return {
            problemId,
            report,
            success: true,
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

    /**
     * Get user's own problems and reports
     */
    myProblems: protectedProcedure.query(async ({ ctx }) => {
      try {
        const problems = await getUserProblems(ctx.user.id);
        return problems;
      } catch (error) {
        console.error("Error fetching user problems:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch problems",
        });
      }
    }),

    /**
     * Get a specific problem with its report
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const result = await getProblemWithReport(input.id);
          if (!result) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Problem not found",
            });
          }

          // Check ownership
          if (result.problem.userId !== ctx.user.id && ctx.user.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have permission to view this problem",
            });
          }

          return result;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching problem:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch problem",
          });
        }
      }),
  }),

  admin: router({
    /**
     * Get all problems (admin only)
     */
    allProblems: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }

        try {
          const result = await getAllProblems(input.limit, input.offset);
          return result;
        } catch (error) {
          console.error("Error fetching all problems:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch problems",
          });
        }
      }),

    /**
     * Update problem status (admin only)
     */
    updateStatus: protectedProcedure
      .input(
        z.object({
          problemId: z.number(),
          status: z.enum(["submitted", "in_progress", "resolved", "rejected"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }

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
     * Delete a problem (admin only)
     */
    deleteProblem: protectedProcedure
      .input(z.object({ problemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }

        try {
          await deleteProblem(input.problemId);
          return { success: true };
        } catch (error) {
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
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        try {
          return await getAllProblemsForMap({
            status: input?.status,
            limit: input?.limit,
            offset: input?.offset,
          });
        } catch (error) {
          console.error("Error fetching map problems:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch map data",
          });
        }
      }),
  }),

  analytics: router({
    /**
     * Get comprehensive analytics overview
     */
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

    /**
     * Detect community issue patterns
     */
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
