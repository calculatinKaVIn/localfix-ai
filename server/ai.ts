import { invokeLLM } from "./_core/llm";
import { ProblemClassification, priorityLevels, problemClassifications } from "../drizzle/schema";

/**
 * AI-generated report structure
 */
export interface GeneratedReport {
  classification: ProblemClassification;
  priority: (typeof priorityLevels)[number];
  department: string;
  subject: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  affectedArea: string;
  suggestedUrgency: string;
  impactScore: number;
}

/**
 * Classify a problem and generate a structured report using AI
 */
export async function generateReport(userDescription: string): Promise<GeneratedReport> {
  const classificationOptions = problemClassifications.join(", ");
  const priorityOptions = priorityLevels.join(", ");

  const systemPrompt = `You are an expert urban infrastructure analyst. Analyze the user's problem description and generate a structured report.

You must respond with ONLY valid JSON in this exact format:
{
  "classification": "one of: ${classificationOptions}",
  "priority": "one of: ${priorityOptions}",
  "department": "appropriate city department name",
  "subject": "concise problem title (max 255 chars)",
  "description": "detailed problem description suitable for city officials",
  "riskLevel": "low, medium, or high",
  "affectedArea": "description of affected area",
  "suggestedUrgency": "e.g., 'Within 7 days' or 'Immediate attention required'",
  "impactScore": "integer from 1-100 representing severity"
}

Guidelines:
- Be specific and professional in descriptions
- Consider public safety when assessing risk and priority
- Map problems to appropriate city departments (Transportation, Parks, Utilities, etc.)
- Impact score: 1-30 (low), 31-70 (medium), 71-100 (high)
- Urgency should be realistic based on the problem type and priority`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this problem: "${userDescription}"` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "problem_report",
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
                description: "Appropriate city department",
              },
              subject: {
                type: "string",
                description: "Concise problem title",
              },
              description: {
                type: "string",
                description: "Detailed problem description",
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Risk level assessment",
              },
              affectedArea: {
                type: "string",
                description: "Description of affected area",
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
    const report = JSON.parse(contentStr) as GeneratedReport;

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

    return report;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Validate a problem description
 */
export function validateProblemDescription(description: string): { valid: boolean; error?: string } {
  if (!description || typeof description !== "string") {
    return { valid: false, error: "Description is required" };
  }

  const trimmed = description.trim();

  if (trimmed.length < 10) {
    return { valid: false, error: "Description must be at least 10 characters long" };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: "Description must not exceed 2000 characters" };
  }

  return { valid: true };
}
