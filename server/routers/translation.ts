/**
 * Translation Router
 * 
 * tRPC procedures for multi-language support
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  detectLanguage,
  translateText,
  translateReportToEnglish,
  getProblemTranslations,
  getSupportedLanguages,
  isLanguageSupported,
  type SupportedLanguage,
} from "../services/translationService";

export const translationRouter = router({
  /**
   * Detect the language of a given text
   */
  detectLanguage: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .query(async ({ input }) => {
      return await detectLanguage(input.text);
    }),

  /**
   * Translate text from one language to another
   */
  translateText: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!isLanguageSupported(input.sourceLanguage)) {
        throw new Error(`Unsupported source language: ${input.sourceLanguage}`);
      }
      if (!isLanguageSupported(input.targetLanguage)) {
        throw new Error(`Unsupported target language: ${input.targetLanguage}`);
      }

      return await translateText(
        input.text,
        input.sourceLanguage as SupportedLanguage,
        input.targetLanguage as SupportedLanguage
      );
    }),

  /**
   * Translate a problem report to English (for city departments)
   */
  translateReportToEnglish: protectedProcedure
    .input(
      z.object({
        problemId: z.number(),
        title: z.string(),
        description: z.string(),
        sourceLanguage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let sourceLanguage: SupportedLanguage | undefined;

      if (input.sourceLanguage) {
        if (!isLanguageSupported(input.sourceLanguage)) {
          throw new Error(`Unsupported language: ${input.sourceLanguage}`);
        }
        sourceLanguage = input.sourceLanguage as SupportedLanguage;
      }

      return await translateReportToEnglish(
        input.problemId,
        input.title,
        input.description,
        sourceLanguage
      );
    }),

  /**
   * Get all translations for a problem
   */
  getProblemTranslations: publicProcedure
    .input(z.object({ problemId: z.number() }))
    .query(async ({ input }) => {
      return await getProblemTranslations(input.problemId);
    }),

  /**
   * Get list of supported languages
   */
  getSupportedLanguages: publicProcedure.query(async () => {
    return getSupportedLanguages();
  }),

  /**
   * Check if a language is supported
   */
  isLanguageSupported: publicProcedure
    .input(z.object({ languageCode: z.string() }))
    .query(async ({ input }) => {
      return isLanguageSupported(input.languageCode);
    }),
});
