import { describe, it, expect } from "vitest";
import { validateAndClassifyProblem, getCategoryDescription, getAllCategories } from "./services/categoryValidation";

/**
 * Category Validation Tests
 * 
 * Tests to ensure AI classification is strict and prevents hallucination
 * by validating that problems are only classified into predefined categories
 * and defaulting to "other" when no confident match is found.
 */

describe("Category Validation - Prevent AI Hallucination", () => {
  it("should classify pothole correctly with high confidence", async () => {
    const result = await validateAndClassifyProblem("There is a large pothole on Main Street");
    expect(result.category).toBe("pothole");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify streetlight correctly", async () => {
    const result = await validateAndClassifyProblem("The street light on 5th Avenue is broken and dark");
    expect(result.category).toBe("streetlight");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify trash correctly", async () => {
    const result = await validateAndClassifyProblem("There is trash and garbage piled up in the park");
    expect(result.category).toBe("trash");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify graffiti correctly", async () => {
    const result = await validateAndClassifyProblem("Graffiti has been spray painted on the bridge");
    expect(result.category).toBe("graffiti");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify sidewalk damage correctly", async () => {
    const result = await validateAndClassifyProblem("The sidewalk is cracked and uneven");
    expect(result.category).toBe("sidewalk");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify water damage correctly", async () => {
    const result = await validateAndClassifyProblem("There is flooding and water damage from the drainage system");
    expect(result.category).toBe("water_damage");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should classify vegetation correctly", async () => {
    const result = await validateAndClassifyProblem("Tree branches are overgrown and blocking the sidewalk");
    expect(result.category).toBe("vegetation");
    expect(result.isDefaultedToOther).toBe(false);
  });

  it("should default to 'other' for unrelated problem", async () => {
    const result = await validateAndClassifyProblem("The city needs more parking spaces downtown");
    expect(result.category).toBe("other");
    expect(result.isDefaultedToOther).toBe(true);
  });

  it("should default to 'other' for vague description", async () => {
    const result = await validateAndClassifyProblem("Something is wrong with the infrastructure");
    expect(result.category).toBe("other");
  });

  it("should not hallucinate new categories", async () => {
    const validCategories = ["pothole", "streetlight", "trash", "graffiti", "sidewalk", "water_damage", "vegetation", "other"];
    const result = await validateAndClassifyProblem("Random problem description");
    expect(validCategories).toContain(result.category);
  });

  it("should extract matched keywords", async () => {
    const result = await validateAndClassifyProblem("There is a pothole on the road");
    expect(result.matchedKeywords).toBeDefined();
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
  });

  it("should provide reasoning for classification", async () => {
    const result = await validateAndClassifyProblem("The street light is broken");
    expect(result.reasoning).toBeDefined();
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it("should handle edge case: multiple categories mentioned", async () => {
    const result = await validateAndClassifyProblem("There is a pothole and graffiti on the street");
    expect(["pothole", "graffiti", "other"]).toContain(result.category);
  });

  it("should handle edge case: very short description", async () => {
    const result = await validateAndClassifyProblem("pothole");
    expect(result.category).toBe("pothole");
  });

  it("should handle edge case: very long description", async () => {
    const longDesc = "There is a large pothole on Main Street that has been there for weeks. " + 
      "It is approximately 2 feet in diameter and 6 inches deep. " +
      "The pothole is causing damage to vehicles and is a safety hazard.";
    const result = await validateAndClassifyProblem(longDesc);
    expect(result.category).toBe("pothole");
  });

  it("should have confidence score between 0-100", async () => {
    const result = await validateAndClassifyProblem("There is a pothole");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it("should get category description for pothole", () => {
    const desc = getCategoryDescription("pothole");
    expect(desc).toContain("Holes");
  });

  it("should get category description for streetlight", () => {
    const desc = getCategoryDescription("streetlight");
    expect(desc).toContain("street light");
  });

  it("should get category description for trash", () => {
    const desc = getCategoryDescription("trash");
    expect(desc).toContain("Trash");
  });

  it("should get category description for graffiti", () => {
    const desc = getCategoryDescription("graffiti");
    expect(desc).toContain("Graffiti");
  });

  it("should get category description for sidewalk", () => {
    const desc = getCategoryDescription("sidewalk");
    expect(desc).toContain("Sidewalk");
  });

  it("should get category description for water_damage", () => {
    const desc = getCategoryDescription("water_damage");
    expect(desc).toContain("Water");
  });

  it("should get category description for vegetation", () => {
    const desc = getCategoryDescription("vegetation");
    expect(desc).toContain("vegetation");
  });

  it("should get category description for other", () => {
    const desc = getCategoryDescription("other");
    expect(desc).toContain("other");
  });

  it("should get all available categories", () => {
    const categories = getAllCategories();
    expect(categories).toHaveProperty("pothole");
    expect(categories).toHaveProperty("streetlight");
    expect(categories).toHaveProperty("trash");
    expect(categories).toHaveProperty("graffiti");
    expect(categories).toHaveProperty("sidewalk");
    expect(categories).toHaveProperty("water_damage");
    expect(categories).toHaveProperty("vegetation");
    expect(categories).toHaveProperty("other");
  });

  it("should have 8 total categories", () => {
    const categories = getAllCategories();
    expect(Object.keys(categories).length).toBe(8);
  });

  it("should not classify unrelated problem as pothole", async () => {
    const result = await validateAndClassifyProblem("The city needs better public transportation");
    expect(result.category).not.toBe("pothole");
  });

  it("should not classify unrelated problem as streetlight", async () => {
    const result = await validateAndClassifyProblem("We need more parks in the neighborhood");
    expect(result.category).not.toBe("streetlight");
  });

  it("should handle case-insensitive keywords", async () => {
    const result1 = await validateAndClassifyProblem("POTHOLE on the road");
    const result2 = await validateAndClassifyProblem("pothole on the road");
    expect(result1.category).toBe(result2.category);
  });

  it("should handle descriptions with special characters", async () => {
    const result = await validateAndClassifyProblem("There's a pothole @ Main St & 5th Ave!");
    expect(result.category).toBe("pothole");
  });

  it("should provide confidence for 'other' category", async () => {
    const result = await validateAndClassifyProblem("The city needs better infrastructure planning");
    expect(result.category).toBe("other");
    expect(result.confidence).toBeDefined();
  });
});
