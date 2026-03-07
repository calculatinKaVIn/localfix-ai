/**
 * Category Validation Service
 * 
 * Implements strict category validation to prevent AI hallucination.
 * Ensures problems are only classified into predefined categories if there's
 * a confident match. Otherwise, defaults to "other" category.
 */

import { invokeLLM } from "../_core/llm";
import { ProblemClassification, problemClassifications } from "../../drizzle/schema";

export interface CategoryValidationResult {
  category: ProblemClassification;
  confidence: number; // 0-100
  matchedKeywords: string[];
  reasoning: string;
  isDefaultedToOther: boolean;
}

/**
 * Predefined category keywords and patterns
 */
const CATEGORY_PATTERNS: Record<ProblemClassification, { keywords: string[]; description: string }> = {
  pothole: {
    keywords: ["pothole", "hole", "pavement", "asphalt", "cracked", "broken road", "road damage", "crater"],
    description: "Holes, cracks, or damage in road surfaces"
  },
  streetlight: {
    keywords: ["streetlight", "street light", "lamp", "light", "broken light", "dark", "lighting", "bulb"],
    description: "Broken, missing, or non-functional street lights"
  },
  trash: {
    keywords: ["trash", "garbage", "litter", "debris", "waste", "rubbish", "dumped", "pile"],
    description: "Trash overflow, litter, or debris accumulation"
  },
  graffiti: {
    keywords: ["graffiti", "spray paint", "vandalism", "tagged", "painted", "wall art"],
    description: "Graffiti or vandalism on public property"
  },
  sidewalk: {
    keywords: ["sidewalk", "pavement", "walkway", "path", "pedestrian", "uneven", "cracked"],
    description: "Sidewalk damage, cracks, or uneven surfaces"
  },
  water_damage: {
    keywords: ["water", "flood", "leak", "wet", "drainage", "drain", "puddle", "moisture", "rain"],
    description: "Water damage, flooding, or drainage issues"
  },
  vegetation: {
    keywords: ["tree", "branch", "vegetation", "plant", "overgrown", "grass", "weeds", "bush"],
    description: "Overgrown vegetation, fallen trees, or branches"
  },
  other: {
    keywords: [],
    description: "Any other urban infrastructure issue not covered by above categories"
  }
};

/**
 * Extract keywords from description
 */
function extractKeywords(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  const words = lowerDesc.split(/\s+/);
  return words.filter(word => word.length > 2);
}

/**
 * Calculate keyword match score for a category
 */
function calculateCategoryScore(description: string, category: ProblemClassification): number {
  if (category === "other") return 0; // Other is default fallback
  
  const keywords = extractKeywords(description);
  const categoryKeywords = CATEGORY_PATTERNS[category].keywords;
  
  let matches = 0;
  for (const keyword of keywords) {
    for (const catKeyword of categoryKeywords) {
      if (keyword.includes(catKeyword) || catKeyword.includes(keyword)) {
        matches++;
      }
    }
  }
  
  // Calculate percentage match
  const maxPossible = Math.max(keywords.length, categoryKeywords.length);
  return maxPossible > 0 ? (matches / maxPossible) * 100 : 0;
}

/**
 * Validate and classify problem into predefined categories
 * Uses keyword matching first, then AI validation if needed
 */
export async function validateAndClassifyProblem(
  description: string,
  userProvidedCategory?: string
): Promise<CategoryValidationResult> {
  try {
    // Step 1: Calculate keyword match scores for all categories
    const scores: Record<ProblemClassification, number> = {} as Record<ProblemClassification, number>;
    
    for (const category of problemClassifications) {
      if (category !== "other") {
        scores[category] = calculateCategoryScore(description, category);
      }
    }
    
    // Step 2: Find best matching category
    let bestCategory: ProblemClassification = "other";
    let bestScore = 0;
    const matchedKeywords: string[] = [];
    
    for (const [category, score] of Object.entries(scores) as [ProblemClassification, number][]) {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as ProblemClassification;
      }
    }
    
    // Step 3: Require minimum confidence threshold (40%) to assign to specific category
    const CONFIDENCE_THRESHOLD = 40;
    
    if (bestScore < CONFIDENCE_THRESHOLD) {
      // If no category meets threshold, use AI validation as secondary check
      return await aiValidateCategory(description, bestCategory, bestScore);
    }
    
    // Extract matched keywords for this category
    const categoryKeywords = CATEGORY_PATTERNS[bestCategory].keywords;
    const descKeywords = extractKeywords(description);
    for (const keyword of descKeywords) {
      for (const catKeyword of categoryKeywords) {
        if (keyword.includes(catKeyword) || catKeyword.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }
    
    return {
      category: bestCategory,
      confidence: bestScore,
      matchedKeywords: Array.from(new Set(matchedKeywords)), // Remove duplicates
      reasoning: `Matched keywords: ${matchedKeywords.join(", ")}. Category: ${CATEGORY_PATTERNS[bestCategory].description}`,
      isDefaultedToOther: false
    };
  } catch (error) {
    console.error("[Category Validation] Error in keyword matching:", error);
    // Fallback to "other" on error
    return {
      category: "other",
      confidence: 0,
      matchedKeywords: [],
      reasoning: "Error during classification, defaulted to 'other'",
      isDefaultedToOther: true
    };
  }
}

/**
 * Secondary AI-based validation when keyword matching is inconclusive
 */
async function aiValidateCategory(
  description: string,
  suggestedCategory: ProblemClassification,
  keywordScore: number
): Promise<CategoryValidationResult> {
  try {
    const categoryList = problemClassifications
      .filter(c => c !== "other")
      .map(c => `- ${c}: ${CATEGORY_PATTERNS[c as ProblemClassification].description}`)
      .join("\n");

    const prompt = `You are a city infrastructure classifier. Classify this problem into ONE of these categories ONLY:

${categoryList}
- other: Any other urban infrastructure issue not covered above

Problem description: "${description}"

IMPORTANT RULES:
1. ONLY use the categories listed above
2. If the problem doesn't clearly match any category, respond with "other"
3. Do NOT hallucinate or create new categories
4. Do NOT add unrelated information to the problem
5. Be conservative - if unsure, use "other"

Respond with ONLY a JSON object:
{
  "category": "one of the categories above",
  "confidence": number between 0-100,
  "reasoning": "brief explanation"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a strict category classifier. You ONLY classify into provided categories. You NEVER hallucinate or add information."
        },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "category_validation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: problemClassifications,
                description: "Validated category"
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "Confidence score"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation"
              }
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = typeof content === "string" ? JSON.parse(content) : content;
    
    // Validate the AI response
    if (!problemClassifications.includes(result.category)) {
      console.warn(`[Category Validation] AI returned invalid category: ${result.category}, defaulting to "other"`);
      return {
        category: "other",
        confidence: 0,
        matchedKeywords: [],
        reasoning: "AI validation failed, defaulted to 'other'",
        isDefaultedToOther: true
      };
    }

    return {
      category: result.category as ProblemClassification,
      confidence: Math.min(result.confidence, 100),
      matchedKeywords: [],
      reasoning: result.reasoning,
      isDefaultedToOther: result.category === "other"
    };
  } catch (error) {
    console.error("[Category Validation] AI validation error:", error);
    // Fallback to "other" on any error
    return {
      category: "other",
      confidence: 0,
      matchedKeywords: [],
      reasoning: "AI validation error, defaulted to 'other'",
      isDefaultedToOther: true
    };
  }
}

/**
 * Get category description
 */
export function getCategoryDescription(category: ProblemClassification): string {
  return CATEGORY_PATTERNS[category]?.description || "Unknown category";
}

/**
 * Get all available categories with descriptions
 */
export function getAllCategories(): Record<ProblemClassification, string> {
  const result: Record<string, string> = {};
  for (const category of problemClassifications) {
    result[category] = CATEGORY_PATTERNS[category as ProblemClassification].description;
  }
  return result as Record<ProblemClassification, string>;
}
