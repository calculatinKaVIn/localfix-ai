/**
 * Translation Service
 * 
 * Provides multi-language support for problem reports using AI translation
 * Automatically detects language and translates to English for city departments
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { problemTranslations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
};

const LANGUAGE_CODES = Object.keys(LANGUAGE_NAMES) as SupportedLanguage[];

export interface DetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0-100
  isSupported: boolean;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  confidence: number; // 0-100
}

/**
 * Detect the language of a given text
 */
export async function detectLanguage(text: string): Promise<DetectionResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a language detection expert. Analyze the given text and determine its language.
          
Respond with ONLY a JSON object in this format:
{
  "language": "<2-letter ISO code>",
  "confidence": <0-100>,
  "supportedLanguages": ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi"]
}

The language code must be one of the supported languages listed above.
Confidence should reflect how certain you are about the detection (0-100).`,
        },
        {
          role: "user",
          content: `Detect the language of this text: "${text}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "language_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              language: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["language", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') throw new Error("No response from LLM");

    const result = JSON.parse(content);
    const language = result.language as SupportedLanguage;
    const isSupported = LANGUAGE_CODES.includes(language);

    return {
      language: isSupported ? language : 'en',
      confidence: result.confidence || 50,
      isSupported,
    };
  } catch (error) {
    console.error("[TranslationService] Language detection failed:", error);
    return {
      language: 'en',
      confidence: 0,
      isSupported: true,
    };
  }
}

/**
 * Translate text from one language to another
 */
export async function translateText(
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslationResult> {
  try {
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        confidence: 100,
      };
    }

    const sourceLangName = LANGUAGE_NAMES[sourceLanguage];
    const targetLangName = LANGUAGE_NAMES[targetLanguage];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in city infrastructure and municipal reports.
          
Translate the following text from ${sourceLangName} to ${targetLangName}.
Maintain the technical accuracy and clarity of the original message.
Preserve any specific details about locations, measurements, or technical terms.

Respond with ONLY a JSON object in this format:
{
  "translatedText": "<translated text>",
  "confidence": <0-100>
}

Confidence should reflect how accurate the translation is (0-100).`,
        },
        {
          role: "user",
          content: `Translate this ${sourceLangName} text to ${targetLangName}:\n\n"${text}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "translation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              translatedText: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["translatedText", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') throw new Error("No response from LLM");

    const result = JSON.parse(content);

    return {
      originalText: text,
      translatedText: result.translatedText || text,
      sourceLanguage,
      targetLanguage,
      confidence: result.confidence || 75,
    };
  } catch (error) {
    console.error("[TranslationService] Translation failed:", error);
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      confidence: 0,
    };
  }
}

/**
 * Translate a problem report to English (for city departments)
 */
export async function translateReportToEnglish(
  problemId: number,
  title: string,
  description: string,
  sourceLanguage?: SupportedLanguage
): Promise<{ title: string; description: string; language: SupportedLanguage; confidence: number }> {
  try {
    // Detect language if not provided
    let detectedLanguage = sourceLanguage;
    if (!detectedLanguage) {
      const detection = await detectLanguage(`${title} ${description}`);
      detectedLanguage = detection.language;
    }

    // If already in English, return as-is
    if (detectedLanguage === 'en') {
      return {
        title,
        description,
        language: 'en',
        confidence: 100,
      };
    }

    // Translate title
    const titleTranslation = await translateText(title, detectedLanguage, 'en');

    // Translate description
    const descriptionTranslation = await translateText(description, detectedLanguage, 'en');

    // Store translation in database
    const db = await getDb();
    if (db) {
      try {
        await db.insert(problemTranslations).values({
          problemId,
          originalLanguage: detectedLanguage,
          language: 'en',
          title: titleTranslation.translatedText,
          description: descriptionTranslation.translatedText,
          translatedBy: 'ai',
          confidence: Math.round((titleTranslation.confidence + descriptionTranslation.confidence) / 2),
          isApproved: 0,
        });
      } catch (dbError) {
        console.warn("[TranslationService] Failed to store translation:", dbError);
      }
    }

    return {
      title: titleTranslation.translatedText,
      description: descriptionTranslation.translatedText,
      language: 'en',
      confidence: Math.round((titleTranslation.confidence + descriptionTranslation.confidence) / 2),
    };
  } catch (error) {
    console.error("[TranslationService] Report translation failed:", error);
    return {
      title,
      description,
      language: 'en',
      confidence: 0,
    };
  }
}

/**
 * Get all translations for a problem
 */
export async function getProblemTranslations(problemId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(problemTranslations)
      .where(eq(problemTranslations.problemId, problemId));
  } catch (error) {
    console.error("[TranslationService] Failed to get translations:", error);
    return [];
  }
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{ code: SupportedLanguage; name: string }> {
  return LANGUAGE_CODES.map((code) => ({
    code,
    name: LANGUAGE_NAMES[code],
  }));
}

/**
 * Translate text to multiple languages
 */
export async function translateToMultipleLanguages(
  text: string,
  sourceLanguage: SupportedLanguage,
  targetLanguages: SupportedLanguage[]
): Promise<Record<SupportedLanguage, TranslationResult>> {
  const results: Record<SupportedLanguage, TranslationResult> = {} as any;

  for (const targetLanguage of targetLanguages) {
    results[targetLanguage] = await translateText(text, sourceLanguage, targetLanguage);
  }

  return results;
}

/**
 * Validate if a language code is supported
 */
export function isLanguageSupported(languageCode: string): languageCode is SupportedLanguage {
  return LANGUAGE_CODES.includes(languageCode as SupportedLanguage);
}
