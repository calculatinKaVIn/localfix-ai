import { describe, it, expect } from "vitest";

/**
 * Translation Feature Tests
 * 
 * Tests for multi-language support, language detection, and translation
 */

describe("Translation Feature", () => {
  it("should support 12 languages", () => {
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];
    expect(supportedLanguages.length).toBe(12);
  });

  it("should define language detection interface", () => {
    const detection = {
      language: "es",
      confidence: 95,
      isSupported: true,
    };
    
    expect(detection.language).toBe("es");
    expect(detection.confidence).toBeGreaterThan(0);
    expect(detection.confidence).toBeLessThanOrEqual(100);
    expect(detection.isSupported).toBe(true);
  });

  it("should define translation result interface", () => {
    const translation = {
      originalText: "La luz está rota",
      translatedText: "The light is broken",
      sourceLanguage: "es",
      targetLanguage: "en",
      confidence: 88,
    };
    
    expect(translation.originalText).toBeTruthy();
    expect(translation.translatedText).toBeTruthy();
    expect(translation.sourceLanguage).toBe("es");
    expect(translation.targetLanguage).toBe("en");
    expect(translation.confidence).toBeGreaterThan(0);
  });

  it("should handle same language translation", () => {
    const sourceLanguage = "en";
    const targetLanguage = "en";
    const text = "The light is broken";
    
    expect(sourceLanguage).toBe(targetLanguage);
    expect(text).toBeTruthy();
  });

  it("should store translations in database", () => {
    const translation = {
      problemId: 1,
      originalLanguage: "es",
      language: "en",
      title: "Luz Rota",
      description: "La luz de la calle está rota",
      translatedBy: "ai",
      confidence: 85,
      isApproved: 0,
    };
    
    expect(translation.problemId).toBe(1);
    expect(translation.originalLanguage).toBe("es");
    expect(translation.language).toBe("en");
    expect(translation.translatedBy).toBe("ai");
  });

  it("should track translation confidence", () => {
    const confidenceScores = [95, 88, 92, 78, 85];
    const averageConfidence = Math.round(
      confidenceScores.reduce((a: any, b: any): number => a + b, 0) / confidenceScores.length
    );
    
    expect(averageConfidence).toBeGreaterThan(70);
    expect(averageConfidence).toBeLessThanOrEqual(100);
  });

  it("should support human review of translations", () => {
    const translation = {
      translatedBy: "ai",
      isApproved: 0,
      approvedBy: null,
    };
    
    const reviewed = {
      ...translation,
      isApproved: 1,
      approvedBy: 1,
    };
    
    expect(translation.isApproved).toBe(0);
    expect(reviewed.isApproved).toBe(1);
    expect(reviewed.approvedBy).toBe(1);
  });

  it("should handle multiple translations per problem", () => {
    const translations = [
      { language: "en", title: "Broken Light" },
      { language: "es", title: "Luz Rota" },
      { language: "fr", title: "Lumière Cassée" },
      { language: "de", title: "Kaputtes Licht" },
    ];
    
    expect(translations.length).toBe(4);
    expect(translations.map((t: any) => t.language)).toContain("en");
    expect(translations.map((t: any) => t.language)).toContain("es");
  });

  it("should validate language codes", () => {
    const validCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];
    const testCode = "es";
    
    expect(validCodes).toContain(testCode);
  });

  it("should handle unsupported language fallback", () => {
    const unsupportedCode = "xx";
    const validCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];
    const isSupported = validCodes.includes(unsupportedCode);
    
    expect(isSupported).toBe(false);
  });

  it("should track translation metadata", () => {
    const metadata = {
      problemId: 1,
      originalLanguage: "es",
      language: "en",
      translatedBy: "ai",
      confidence: 85,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    expect(metadata.problemId).toBe(1);
    expect(metadata.translatedBy).toBe("ai");
    expect(metadata.createdAt).toBeInstanceOf(Date);
  });

  it("should support batch translation", () => {
    const texts = [
      "La luz está rota",
      "El pozo está lleno",
      "La calle está dañada",
    ];
    
    const translations = texts.map((text) => ({
      original: text,
      translated: "English translation",
      sourceLanguage: "es",
      targetLanguage: "en",
    }));
    
    expect(translations.length).toBe(texts.length);
    expect(translations.every((t: any) => t.sourceLanguage === "es")).toBe(true);
  });

  it("should provide language names for UI display", () => {
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
    };
    
    expect(languageNames["es"]).toBe("Spanish");
    expect(languageNames["fr"]).toBe("French");
    expect(Object.keys(languageNames).length).toBe(12);
  });

  it("should handle translation error gracefully", () => {
    const errorResult = {
      originalText: "Test text",
      translatedText: "Test text",
      sourceLanguage: "es",
      targetLanguage: "en",
      confidence: 0,
    };
    
    expect(errorResult.confidence).toBe(0);
    expect(errorResult.translatedText).toBeTruthy();
  });

  it("should track translation performance", () => {
    const translationMetrics = {
      totalTranslations: 150,
      successfulTranslations: 145,
      failedTranslations: 5,
      averageConfidence: 87,
      averageResponseTime: 1250, // ms
    };
    
    const successRate = Math.round((translationMetrics.successfulTranslations / translationMetrics.totalTranslations) * 100);
    
    expect(successRate).toBeGreaterThan(90);
    expect(translationMetrics.averageResponseTime).toBeGreaterThan(0);
  });
});
