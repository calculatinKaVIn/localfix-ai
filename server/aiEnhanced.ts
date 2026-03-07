import { invokeLLM } from "./_core/llm";
import { ProblemClassification, priorityLevels, problemClassifications } from "../drizzle/schema";

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
 * Generate comprehensive AI report with detailed analysis
 */
export async function generateEnhancedReport(
  userDescription: string,
  imageUrl?: string
): Promise<EnhancedGeneratedReport> {
  const classificationOptions = problemClassifications.join(", ");
  const priorityOptions = priorityLevels.join(", ");

  const systemPrompt = `You are an expert urban infrastructure analyst with deep knowledge of city planning, public safety, and infrastructure management. Analyze the user's problem description and generate a comprehensive structured report.

You must respond with ONLY valid JSON in this exact format with all required fields.

Guidelines:
- Be specific and professional in all descriptions
- Consider public safety as the primary concern
- Map problems to appropriate city departments (Transportation, Parks, Utilities, Public Health, etc.)
- Impact score: 1-30 (low), 31-70 (medium), 71-100 (high)
- Urgency should be realistic based on the problem type and priority
- Provide actionable recommendations
- Consider environmental and community impacts
- Identify affected stakeholder groups
- Estimate repair costs realistically
- Consider related infrastructure issues`;

  const userMessage = imageUrl
    ? `Please analyze this problem: "${userDescription}"\n\nImage provided: ${imageUrl}\n\nProvide a comprehensive analysis including safety considerations, environmental impact, affected stakeholders, repair cost estimates, and recommended solutions.`
    : `Please analyze this problem: "${userDescription}"\n\nProvide a comprehensive analysis including safety considerations, environmental impact, affected stakeholders, repair cost estimates, and recommended solutions.`;

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
                description: "Professional description for city officials",
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
                description: "Comprehensive analysis of the problem including root causes and contributing factors",
              },
              safetyConsiderations: {
                type: "string",
                description: "Public safety implications and hazards",
              },
              environmentalImpact: {
                type: "string",
                description: "Environmental and ecological considerations",
              },
              affectedStakeholders: {
                type: "string",
                description: "Groups affected by this problem (residents, businesses, pedestrians, etc.)",
              },
              estimatedRepairCost: {
                type: "string",
                description: "Estimated cost range for repair or mitigation",
              },
              recommendedSolution: {
                type: "string",
                description: "Recommended approach to address the problem",
              },
              timelineEstimate: {
                type: "string",
                description: "Realistic timeline for implementation",
              },
              relatedIssues: {
                type: "array",
                items: { type: "string" },
                description: "Related infrastructure issues that may need attention",
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
    const report = JSON.parse(contentStr) as EnhancedGeneratedReport;

    // Validate the response
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

    return report;
  } catch (error) {
    console.error("Error generating enhanced report:", error);
    throw new Error(
      `Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
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
