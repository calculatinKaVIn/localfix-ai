/**
 * AI Chatbot Service
 * 
 * Provides conversational AI assistance for problem reporting
 */

import { invokeLLM } from "../_core/llm";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  nextStep?: string;
  reportData?: {
    title?: string;
    description?: string;
    category?: string;
    urgency?: string;
  };
}

/**
 * Chat with AI assistant for guided problem reporting
 */
export async function chatWithAssistant(
  messages: ChatMessage[],
  context?: {
    title?: string;
    description?: string;
    category?: string;
  }
): Promise<ChatResponse> {
  const systemPrompt = `You are a helpful AI assistant for the LocalFix AI problem reporting system. Your role is to:
1. Guide users through reporting city infrastructure problems
2. Ask clarifying questions to understand the issue better
3. Suggest problem categories (pothole, trash, streetlight, graffiti, etc.)
4. Help users provide complete and accurate information
5. Offer safety advice when relevant

Be friendly, concise, and action-oriented. Ask one or two questions at a time.
If the user provides a problem description, extract and suggest: title, category, urgency level.

${
  context
    ? `Current problem context:
- Title: ${context.title || "Not provided"}
- Description: ${context.description || "Not provided"}
- Category: ${context.category || "Not identified"}`
    : ""
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const content = response.choices[0].message.content;
  const messageText = typeof content === "string" ? content : "";

  return {
    message: messageText,
    suggestions: extractSuggestions(messageText),
    nextStep: extractNextStep(messageText),
  };
}

/**
 * Ask follow-up questions about a problem
 */
export async function askFollowUpQuestions(
  title: string,
  description: string,
  category: string
): Promise<string[]> {
  const prompt = `Generate 3-4 follow-up questions to help clarify this problem report:

Title: ${title}
Description: ${description}
Category: ${category}

Questions should be specific, actionable, and help gather missing information.
Respond with JSON:
{
  "questions": ["question1", "question2", "question3"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert at asking clarifying questions.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "follow_up_questions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: { type: "array", items: { type: "string" } },
          },
          required: ["questions"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.questions;
    }
    return [];
  } catch (error) {
    console.error("[Follow-up Questions] Error parsing response:", error);
    return [];
  }
}

/**
 * Clarify vague or unclear report
 */
export async function clarifyReport(
  vagueProblem: string
): Promise<{
  clarifiedDescription: string;
  suggestedCategory: string;
  suggestedTitle: string;
}> {
  const prompt = `Clarify and improve this vague problem description:

"${vagueProblem}"

Provide JSON with clarifications:
{
  "clarifiedDescription": "Clearer, more specific description",
  "suggestedCategory": "pothole|trash|streetlight|graffiti|other",
  "suggestedTitle": "Concise problem title"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at clarifying vague problem descriptions.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "clarified_report",
        strict: true,
        schema: {
          type: "object",
          properties: {
            clarifiedDescription: { type: "string" },
            suggestedCategory: {
              type: "string",
              enum: ["pothole", "trash", "streetlight", "graffiti", "other"],
            },
            suggestedTitle: { type: "string" },
          },
          required: [
            "clarifiedDescription",
            "suggestedCategory",
            "suggestedTitle",
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
    console.error("[Clarify Report] Error parsing response:", error);
    throw error;
  }
}

/**
 * Suggest better wording for a report
 */
export async function suggestBetterWording(text: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at improving written communication. Suggest better wording that is clearer and more professional.",
      },
      {
        role: "user",
        content: `Suggest better wording for this problem report:\n\n"${text}"\n\nProvide only the improved version, no explanation.`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Explain which department handles a specific issue
 */
export async function explainDepartmentResponsibility(
  category: string,
  description: string
): Promise<{
  department: string;
  responsibility: string;
  contactInfo: string;
}> {
  const prompt = `Explain which city department should handle this problem and their responsibility:

Category: ${category}
Description: ${description}

Respond with JSON:
{
  "department": "Department name",
  "responsibility": "What this department typically handles",
  "contactInfo": "General contact information or how to reach them"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert on city government departments and their responsibilities.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "department_info",
        strict: true,
        schema: {
          type: "object",
          properties: {
            department: { type: "string" },
            responsibility: { type: "string" },
            contactInfo: { type: "string" },
          },
          required: ["department", "responsibility", "contactInfo"],
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
    console.error("[Department Info] Error parsing response:", error);
    throw error;
  }
}

/**
 * Provide legal or city rule references
 */
export async function provideLegalReferences(
  category: string,
  description: string
): Promise<string[]> {
  const prompt = `Provide relevant legal or city rule references for this problem:

Category: ${category}
Description: ${description}

List relevant city ordinances, regulations, or legal references that apply.
Respond with JSON:
{
  "references": ["reference1", "reference2", "reference3"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert on city regulations and legal references.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "legal_references",
        strict: true,
        schema: {
          type: "object",
          properties: {
            references: { type: "array", items: { type: "string" } },
          },
          required: ["references"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.references;
    }
    return [];
  } catch (error) {
    console.error("[Legal References] Error parsing response:", error);
    return [];
  }
}

/**
 * Recommend community resources
 */
export async function recommendCommunityResources(
  category: string,
  description: string
): Promise<string[]> {
  const prompt = `Recommend community resources or organizations that might help with this problem:

Category: ${category}
Description: ${description}

List relevant community organizations, volunteer groups, or resources.
Respond with JSON:
{
  "resources": ["resource1", "resource2", "resource3"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert on community resources and local organizations.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "community_resources",
        strict: true,
        schema: {
          type: "object",
          properties: {
            resources: { type: "array", items: { type: "string" } },
          },
          required: ["resources"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.resources;
    }
    return [];
  } catch (error) {
    console.error("[Community Resources] Error parsing response:", error);
    return [];
  }
}

/**
 * Helper: Extract suggestions from message
 */
function extractSuggestions(message: string): string[] {
  const suggestions: string[] = [];
  const lines = message.split("\n");

  for (const line of lines) {
    if (line.includes("suggest") || line.includes("recommend")) {
      suggestions.push(line.trim());
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Helper: Extract next step from message
 */
function extractNextStep(message: string): string | undefined {
  const lines = message.split("\n");

  for (const line of lines) {
    if (
      line.includes("next") ||
      line.includes("then") ||
      line.includes("please provide")
    ) {
      return line.trim();
    }
  }

  return undefined;
}
