import { invokeLLM } from "./_core/llm";
import { ProblemClassification, priorityLevels, problemClassifications } from "../drizzle/schema";
import { validateAndClassifyProblem } from "./services/categoryValidation";

/**
 * Enhanced AI-generated report structure with comprehensive analysis
 */
export interface EnhancedGeneratedReport {
  classification: ProblemClassification;
  priority: (typeof priorityLevels)[number];
  department: string;
  subject: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  affectedArea: string;
  suggestedUrgency: string;
  impactScore: number;
  // Enhanced fields
  detailedAnalysis: string;
  safetyConsiderations: string;
  environmentalImpact: string;
  affectedStakeholders: string;
  estimatedRepairCost: string;
  recommendedSolution: string;
  timelineEstimate: string;
  relatedIssues: string[];
}

/**
 * Generate comprehensive AI report with strict category validation
 * 
 * This function implements safeguards against AI hallucination:
 * 1. Validates category matches predefined list (pothole, streetlight, trash, graffiti, sidewalk, water_damage, vegetation, other)
 * 2. Defaults to "other" if no confident match found
 * 3. Generates report based strictly on user input without fabricating details
 * 4. For "other" category, creates custom report based on actual problem description
 */
export async function generateEnhancedReport(
  userDescription: string,
  imageUrl?: string
): Promise<EnhancedGeneratedReport> {
  const classificationOptions = problemClassifications.join(", ");
  const priorityOptions = priorityLevels.join(", ");

  // Step 1: Validate and classify the problem strictly
  const validationResult = await validateAndClassifyProblem(userDescription);
  const confirmedCategory = validationResult.category;

  // Step 2: Create system prompt that enforces strict category and prevents hallucination
  const systemPrompt = `You are an expert urban infrastructure analyst. Your job is to analyze problem reports STRICTLY based on what the user provided.

CRITICAL RULES:
1. DO NOT hallucinate or fabricate details not mentioned by the user
2. DO NOT add unrelated information or scenarios
3. Only analyze what the user explicitly described
4. For "other" category problems, create a custom analysis based on the actual description
5. Keep all descriptions grounded in the user's input
6. Be conservative with estimates - only provide what can be reasonably inferred

Category: ${confirmedCategory}
Category Description: ${getCategoryDescription(confirmedCategory)}

If the problem is in "other" category, analyze it based on what the user actually described without forcing it into unrelated scenarios.`;

  const userMessage = imageUrl
    ? `Please analyze this problem: "${userDescription}"\n\nImage provided: ${imageUrl}\n\nProvide analysis based ONLY on what is described. Do not add unrelated information. Do not hallucinate details.`
    : `Please analyze this problem: "${userDescription}"\n\nProvide analysis based ONLY on what is described. Do not add unrelated information. Do not hallucinate details.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "enhanced_problem_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                enum: problemClassifications,
                description: "Type of urban infrastructure problem",
              },
              priority: {
                type: "string",
                enum: priorityLevels,
                description: "Priority level for addressing the problem",
              },
              department: {
                type: "string",
                description: "Appropriate city department responsible",
              },
              subject: {
                type: "string",
                description: "Concise problem title (max 255 chars)",
              },
              description: {
                type: "string",
                description: "Professional description for city officials based on user input",
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Risk level assessment",
              },
              affectedArea: {
                type: "string",
                description: "Description of affected area and scope",
              },
              suggestedUrgency: {
                type: "string",
                description: "Suggested timeline for resolution",
              },
              impactScore: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                description: "Impact score from 1-100",
              },
              detailedAnalysis: {
                type: "string",
                description: "Analysis based on user description - do not fabricate details",
              },
              safetyConsiderations: {
                type: "string",
                description: "Public safety implications based on what was described",
              },
              environmentalImpact: {
                type: "string",
                description: "Environmental considerations if applicable",
              },
              affectedStakeholders: {
                type: "string",
                description: "Groups affected by this problem",
              },
              estimatedRepairCost: {
                type: "string",
                description: "Estimated cost range if applicable",
              },
              recommendedSolution: {
                type: "string",
                description: "Recommended approach based on the problem",
              },
              timelineEstimate: {
                type: "string",
                description: "Realistic timeline for implementation",
              },
              relatedIssues: {
                type: "array",
                items: { type: "string" },
                description: "Related infrastructure issues if any",
              },
            },
            required: [
              "classification",
              "priority",
              "department",
              "subject",
              "description",
              "riskLevel",
              "affectedArea",
              "suggestedUrgency",
              "impactScore",
              "detailedAnalysis",
              "safetyConsiderations",
              "environmentalImpact",
              "affectedStakeholders",
              "estimatedRepairCost",
              "recommendedSolution",
              "timelineEstimate",
              "relatedIssues",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse the response
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    let report = JSON.parse(contentStr) as EnhancedGeneratedReport;

    // Step 3: Force the validated category to prevent AI from changing it
    report.classification = confirmedCategory;

    // Step 4: Validate the response
    if (!problemClassifications.includes(report.classification)) {
      throw new Error(`Invalid classification: ${report.classification}`);
    }

    if (!priorityLevels.includes(report.priority)) {
      throw new Error(`Invalid priority: ${report.priority}`);
    }

    if (!["low", "medium", "high"].includes(report.riskLevel)) {
      throw new Error(`Invalid risk level: ${report.riskLevel}`);
    }

    if (report.impactScore < 1 || report.impactScore > 100) {
      throw new Error(`Invalid impact score: ${report.impactScore}`);
    }

    if (!Array.isArray(report.relatedIssues)) {
      throw new Error("Related issues must be an array");
    }

    // Step 5: Log validation details for debugging
    console.log(`[Report Generation] Category validation: ${confirmedCategory} (confidence: ${validationResult.confidence}%, defaulted: ${validationResult.isDefaultedToOther})`);

    return report;
  } catch (error) {
    console.error("Error generating enhanced report:", error);
    throw new Error(
      `Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get category description for system prompt
 */
function getCategoryDescription(category: ProblemClassification): string {
  const descriptions: Record<ProblemClassification, string> = {
    pothole: "Holes, cracks, or damage in road surfaces",
    streetlight: "Broken, missing, or non-functional street lights",
    trash: "Trash overflow, litter, or debris accumulation",
    graffiti: "Graffiti or vandalism on public property",
    sidewalk: "Sidewalk damage, cracks, or uneven surfaces",
    water_damage: "Water damage, flooding, or drainage issues",
    vegetation: "Overgrown vegetation, fallen trees, or branches",
    other: "Any other urban infrastructure issue not covered by above categories"
  };
  return descriptions[category];
}

/**
 * Validate problem description
 */
export function validateProblemDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: "Description cannot be empty" };
  }

  if (description.length < 10) {
    return { valid: false, error: "Description must be at least 10 characters" };
  }

  if (description.length > 2000) {
    return { valid: false, error: "Description cannot exceed 2000 characters" };
  }

  return { valid: true };
}
