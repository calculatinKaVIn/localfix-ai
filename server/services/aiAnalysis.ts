/**
 * AI Analysis Service
 * 
 * Provides comprehensive AI-powered analysis for problem reports including:
 * - Problem categorization and urgency assessment
 * - Safety and danger level prediction
 * - Location intelligence
 * - Report generation and formatting
 * - Duplicate detection
 * - Multi-language support
 */

import { invokeLLM } from "../_core/llm";

export interface ProblemAnalysis {
  category: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  dangerLevel: "safe" | "caution" | "danger" | "critical";
  suggestedDepartment: string;
  formalReport: string;
  safetyAdvice: string[];
  estimatedRepairType: string;
  repairPriority: "low" | "medium" | "high" | "urgent";
  injuryRiskLevel: "minimal" | "moderate" | "high" | "severe";
  affectedPopulation: string;
  publicSafetyUrgency: string;
}

export interface LocationAnalysis {
  nearestDistrict: string;
  nearestGovernmentOffice: string;
  nearSchoolZone: boolean;
  nearHospital: boolean;
  onPublicProperty: boolean;
  trafficImpact: string;
  highAccidentArea: boolean;
  landmarks: string[];
  populationEstimate: string;
}

export interface ReportFormats {
  emailFormat: string;
  socialMediaPost: string;
  phoneScript: string;
  shortVersion: string;
  engineeringDescription: string;
  publicAwarenessMessage: string;
  newsHeadline: string;
  socialCampaign: string;
}

export interface SafetyAnalysis {
  cyclistDanger: boolean;
  disabledPedestrianDanger: boolean;
  nightVisibilityRisk: boolean;
  fireHazard: boolean;
  floodRisk: boolean;
  vehicleDamageRisk: boolean;
  temporaryWarnings: string[];
  routeAlternatives: string[];
}

export interface CityInsights {
  similarProblemsNearby: number;
  maintenancePriority: string;
  improvementIdeas: string[];
  communityVolunteerSolutions: string[];
  environmentalImpact: string;
  accessibilityIssues: string[];
  estimatedRepairCost: string;
  estimatedRepairTime: string;
  predictedDepartmentResponseTime: string;
}

/**
 * Analyze a problem report comprehensively using AI
 */
export async function analyzeProblem(
  title: string,
  description: string,
  latitude?: string,
  longitude?: string
): Promise<ProblemAnalysis> {
  const prompt = `You are an expert urban infrastructure analyst. Analyze this city problem report and provide structured analysis.

Problem Title: ${title}
Description: ${description}
${latitude && longitude ? `Location: ${latitude}, ${longitude}` : ""}

Provide analysis in JSON format with these fields:
{
  "category": "pothole|trash|streetlight|graffiti|other",
  "urgencyLevel": "low|medium|high|critical",
  "dangerLevel": "safe|caution|danger|critical",
  "suggestedDepartment": "Department name that should handle this",
  "formalReport": "Professional formal version of the report",
  "safetyAdvice": ["advice1", "advice2"],
  "estimatedRepairType": "Type of repair needed",
  "repairPriority": "low|medium|high|urgent",
  "injuryRiskLevel": "minimal|moderate|high|severe",
  "affectedPopulation": "Estimate of people affected",
  "publicSafetyUrgency": "Assessment of public safety urgency"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert urban infrastructure analyst. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "problem_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["pothole", "trash", "streetlight", "graffiti", "other"],
            },
            urgencyLevel: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            dangerLevel: {
              type: "string",
              enum: ["safe", "caution", "danger", "critical"],
            },
            suggestedDepartment: { type: "string" },
            formalReport: { type: "string" },
            safetyAdvice: { type: "array", items: { type: "string" } },
            estimatedRepairType: { type: "string" },
            repairPriority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
            injuryRiskLevel: {
              type: "string",
              enum: ["minimal", "moderate", "high", "severe"],
            },
            affectedPopulation: { type: "string" },
            publicSafetyUrgency: { type: "string" },
          },
          required: [
            "category",
            "urgencyLevel",
            "dangerLevel",
            "suggestedDepartment",
            "formalReport",
            "safetyAdvice",
            "estimatedRepairType",
            "repairPriority",
            "injuryRiskLevel",
            "affectedPopulation",
            "publicSafetyUrgency",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[AI Analysis] Error parsing response:", error);
    throw error;
  }
}

/**
 * Generate multiple report formats for a problem
 */
export async function generateReportFormats(
  title: string,
  description: string,
  category: string,
  department: string
): Promise<ReportFormats> {
  const prompt = `Generate multiple report formats for this city infrastructure problem:

Title: ${title}
Description: ${description}
Category: ${category}
Department: ${department}

Provide JSON with these formats:
{
  "emailFormat": "Professional email to city department",
  "socialMediaPost": "Engaging social media post (280 chars max)",
  "phoneScript": "Script for calling city services",
  "shortVersion": "Brief 1-2 sentence summary",
  "engineeringDescription": "Technical engineering description",
  "publicAwarenessMessage": "Message to raise public awareness",
  "newsHeadline": "Local news headline style",
  "socialCampaign": "Social media campaign text"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert in communication and report writing.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "report_formats",
        strict: true,
        schema: {
          type: "object",
          properties: {
            emailFormat: { type: "string" },
            socialMediaPost: { type: "string" },
            phoneScript: { type: "string" },
            shortVersion: { type: "string" },
            engineeringDescription: { type: "string" },
            publicAwarenessMessage: { type: "string" },
            newsHeadline: { type: "string" },
            socialCampaign: { type: "string" },
          },
          required: [
            "emailFormat",
            "socialMediaPost",
            "phoneScript",
            "shortVersion",
            "engineeringDescription",
            "publicAwarenessMessage",
            "newsHeadline",
            "socialCampaign",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[Report Formats] Error parsing response:", error);
    throw error;
  }
}

/**
 * Analyze safety aspects of a problem
 */
export async function analyzeSafety(
  title: string,
  description: string,
  category: string
): Promise<SafetyAnalysis> {
  const prompt = `Analyze safety aspects of this city problem:

Title: ${title}
Description: ${description}
Category: ${category}

Provide JSON analysis:
{
  "cyclistDanger": boolean,
  "disabledPedestrianDanger": boolean,
  "nightVisibilityRisk": boolean,
  "fireHazard": boolean,
  "floodRisk": boolean,
  "vehicleDamageRisk": boolean,
  "temporaryWarnings": ["warning1", "warning2"],
  "routeAlternatives": ["alternative1", "alternative2"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a safety and urban planning expert.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "safety_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            cyclistDanger: { type: "boolean" },
            disabledPedestrianDanger: { type: "boolean" },
            nightVisibilityRisk: { type: "boolean" },
            fireHazard: { type: "boolean" },
            floodRisk: { type: "boolean" },
            vehicleDamageRisk: { type: "boolean" },
            temporaryWarnings: { type: "array", items: { type: "string" } },
            routeAlternatives: { type: "array", items: { type: "string" } },
          },
          required: [
            "cyclistDanger",
            "disabledPedestrianDanger",
            "nightVisibilityRisk",
            "fireHazard",
            "floodRisk",
            "vehicleDamageRisk",
            "temporaryWarnings",
            "routeAlternatives",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[Safety Analysis] Error parsing response:", error);
    throw error;
  }
}

/**
 * Generate city insights and improvement suggestions
 */
export async function generateCityInsights(
  title: string,
  description: string,
  category: string,
  latitude?: string,
  longitude?: string
): Promise<CityInsights> {
  const prompt = `Generate city planning insights for this infrastructure problem:

Title: ${title}
Description: ${description}
Category: ${category}
${latitude && longitude ? `Location: ${latitude}, ${longitude}` : ""}

Provide JSON with insights:
{
  "similarProblemsNearby": 0-10,
  "maintenancePriority": "low|medium|high|critical",
  "improvementIdeas": ["idea1", "idea2"],
  "communityVolunteerSolutions": ["solution1", "solution2"],
  "environmentalImpact": "Assessment of environmental impact",
  "accessibilityIssues": ["issue1", "issue2"],
  "estimatedRepairCost": "Cost estimate",
  "estimatedRepairTime": "Time estimate",
  "predictedDepartmentResponseTime": "Response time prediction"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an urban planning and city infrastructure expert.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "city_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            similarProblemsNearby: { type: "integer", minimum: 0, maximum: 10 },
            maintenancePriority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            improvementIdeas: { type: "array", items: { type: "string" } },
            communityVolunteerSolutions: {
              type: "array",
              items: { type: "string" },
            },
            environmentalImpact: { type: "string" },
            accessibilityIssues: { type: "array", items: { type: "string" } },
            estimatedRepairCost: { type: "string" },
            estimatedRepairTime: { type: "string" },
            predictedDepartmentResponseTime: { type: "string" },
          },
          required: [
            "similarProblemsNearby",
            "maintenancePriority",
            "improvementIdeas",
            "communityVolunteerSolutions",
            "environmentalImpact",
            "accessibilityIssues",
            "estimatedRepairCost",
            "estimatedRepairTime",
            "predictedDepartmentResponseTime",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[City Insights] Error parsing response:", error);
    throw error;
  }
}

/**
 * Translate report to multiple languages
 */
export async function translateReport(
  text: string,
  languages: string[] = ["Spanish", "French", "German", "Chinese"]
): Promise<Record<string, string>> {
  const prompt = `Translate this problem report into ${languages.join(", ")}:

"${text}"

Provide JSON with language codes as keys:
{
  "es": "Spanish translation",
  "fr": "French translation",
  "de": "German translation",
  "zh": "Chinese translation"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional translator.",
      },
      { role: "user", content: prompt },
    ],
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[Translation] Error parsing response:", error);
    throw error;
  }
}

/**
 * Summarize a long report
 */
export async function summarizeReport(text: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at summarizing reports concisely. Provide only the summary, no additional text.",
      },
      {
        role: "user",
        content: `Summarize this problem report in 2-3 sentences:\n\n${text}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Detect if a report is incomplete and suggest missing information
 */
export async function detectIncompleteReport(
  title: string,
  description: string
): Promise<{ isIncomplete: boolean; suggestions: string[] }> {
  const prompt = `Analyze if this problem report is incomplete and suggest what's missing:

Title: ${title}
Description: ${description}

Respond with JSON:
{
  "isIncomplete": boolean,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert at evaluating problem reports.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "report_completeness",
        strict: true,
        schema: {
          type: "object",
          properties: {
            isIncomplete: { type: "boolean" },
            suggestions: { type: "array", items: { type: "string" } },
          },
          required: ["isIncomplete", "suggestions"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[Report Completeness] Error parsing response:", error);
    throw error;
  }
}
