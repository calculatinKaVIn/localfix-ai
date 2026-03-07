/**
 * Image Analysis Service
 * 
 * Analyzes uploaded images to detect infrastructure issues
 * Generates descriptions and auto-populates report fields
 */

import { invokeLLM } from "../_core/llm";

export interface ImageAnalysisResult {
  issueType: string; // e.g., "pothole", "broken_light", "graffiti"
  confidence: number; // 0-100
  description: string; // AI-generated description
  severity: "low" | "medium" | "high" | "critical";
  affectedArea: string; // e.g., "road", "sidewalk", "street_light"
  recommendedAction: string;
  safetyRisks: string[];
  estimatedImpact: string;
}

export interface ImageUploadMetadata {
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
}

/**
 * Analyze an image to detect infrastructure issues
 * @param imageUrl - URL of the image to analyze
 * @returns Analysis result with detected issue type and description
 */
export async function analyzeImageForIssues(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert infrastructure inspector. Analyze the provided image and identify any city infrastructure issues (potholes, broken lights, graffiti, flooding, debris, etc.).

Respond with ONLY a JSON object in this format:
{
  "issueType": "<type of issue>",
  "confidence": <0-100>,
  "description": "<detailed description of the issue>",
  "severity": "<low|medium|high|critical>",
  "affectedArea": "<what area is affected>",
  "recommendedAction": "<what should be done>",
  "safetyRisks": ["<risk1>", "<risk2>"],
  "estimatedImpact": "<impact description>"
}

Be specific and technical in your analysis. If no issue is detected, still provide a response indicating normal conditions.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for infrastructure issues:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "image_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              issueType: { type: "string" },
              confidence: { type: "number" },
              description: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              affectedArea: { type: "string" },
              recommendedAction: { type: "string" },
              safetyRisks: { type: "array", items: { type: "string" } },
              estimatedImpact: { type: "string" },
            },
            required: [
              "issueType",
              "confidence",
              "description",
              "severity",
              "affectedArea",
              "recommendedAction",
              "safetyRisks",
              "estimatedImpact",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    const result = JSON.parse(content);

    return {
      issueType: result.issueType || "unknown_issue",
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      description: result.description || "Unable to determine issue type",
      severity: result.severity || "medium",
      affectedArea: result.affectedArea || "unknown",
      recommendedAction: result.recommendedAction || "Requires inspection",
      safetyRisks: Array.isArray(result.safetyRisks) ? result.safetyRisks : [],
      estimatedImpact: result.estimatedImpact || "Unknown impact",
    };
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze image:", error);
    return {
      issueType: "analysis_failed",
      confidence: 0,
      description: "Unable to analyze image. Please provide a description.",
      severity: "medium",
      affectedArea: "unknown",
      recommendedAction: "Manual review required",
      safetyRisks: ["Unable to assess"],
      estimatedImpact: "Unknown",
    };
  }
}

/**
 * Generate a detailed problem description from image analysis
 */
export function generateDescriptionFromAnalysis(analysis: ImageAnalysisResult): string {
  const lines = [
    analysis.description,
    "",
    `**Affected Area:** ${analysis.affectedArea}`,
    `**Severity:** ${analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}`,
    `**Recommended Action:** ${analysis.recommendedAction}`,
  ];

  if (analysis.safetyRisks.length > 0) {
    lines.push("");
    lines.push("**Safety Risks:**");
    analysis.safetyRisks.forEach((risk) => {
      lines.push(`- ${risk}`);
    });
  }

  lines.push("");
  lines.push(`**Estimated Impact:** ${analysis.estimatedImpact}`);

  return lines.join("\n");
}

/**
 * Map issue type to problem classification
 */
export function mapIssueTypeToClassification(issueType: string): string {
  const mappings: Record<string, string> = {
    pothole: "Road Damage",
    broken_light: "Broken Street Light",
    graffiti: "Graffiti",
    flooding: "Flooding",
    debris: "Debris/Obstruction",
    broken_sidewalk: "Sidewalk Damage",
    tree_hazard: "Tree Hazard",
    sign_damage: "Sign Damage",
    trash_overflow: "Trash Overflow",
    water_leak: "Water Leak",
    electrical_hazard: "Electrical Hazard",
    traffic_signal_issue: "Traffic Signal Issue",
  };

  return mappings[issueType.toLowerCase()] || "Infrastructure Issue";
}

/**
 * Map severity to priority level
 */
export function mapSeverityToPriority(severity: string): string {
  const mappings: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  return mappings[severity.toLowerCase()] || "Medium";
}

/**
 * Validate image before analysis
 */
export function validateImageForAnalysis(
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image format. Allowed: JPEG, PNG, WebP, GIF`,
    };
  }

  if (size > MAX_SIZE) {
    return {
      valid: false,
      error: `Image too large. Maximum size: 10MB`,
    };
  }

  if (size < 1024) {
    return {
      valid: false,
      error: `Image too small. Minimum size: 1KB`,
    };
  }

  return { valid: true };
}

/**
 * Extract metadata from image
 */
export function extractImageMetadata(
  filename: string,
  size: number,
  mimeType: string
): ImageUploadMetadata {
  return {
    filename,
    size,
    mimeType,
    uploadedAt: new Date(),
  };
}

/**
 * Generate a confidence-based summary
 */
export function generateConfidenceSummary(confidence: number): string {
  if (confidence >= 90) return "Very High Confidence";
  if (confidence >= 75) return "High Confidence";
  if (confidence >= 60) return "Moderate Confidence";
  if (confidence >= 40) return "Low Confidence";
  return "Very Low Confidence";
}
