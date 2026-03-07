/**
 * Location Intelligence Service
 * 
 * Provides location-based analysis and insights using Google Maps APIs
 */

import { invokeLLM } from "../_core/llm";

export interface LocationAnalysis {
  district: string;
  nearestGovernmentOffice: string;
  nearSchoolZone: boolean;
  nearHospital: boolean;
  nearEmergencyRoute: boolean;
  onPublicProperty: boolean;
  landmarks: string[];
  trafficImpact: string;
  highAccidentArea: boolean;
  populationDensity: string;
}

/**
 * Analyze location using coordinates
 */
export async function analyzeLocation(
  latitude: string,
  longitude: string
): Promise<LocationAnalysis> {
  const prompt = `Analyze this geographic location for urban planning purposes:

Coordinates: ${latitude}, ${longitude}

Provide JSON with location analysis:
{
  "district": "District or neighborhood name",
  "nearestGovernmentOffice": "Type and distance of nearest government office",
  "nearSchoolZone": boolean,
  "nearHospital": boolean,
  "nearEmergencyRoute": boolean,
  "onPublicProperty": boolean,
  "landmarks": ["landmark1", "landmark2"],
  "trafficImpact": "Assessment of traffic impact",
  "highAccidentArea": boolean,
  "populationDensity": "high|medium|low"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an urban planning and geography expert. Analyze locations based on coordinates.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "location_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            district: { type: "string" },
            nearestGovernmentOffice: { type: "string" },
            nearSchoolZone: { type: "boolean" },
            nearHospital: { type: "boolean" },
            nearEmergencyRoute: { type: "boolean" },
            onPublicProperty: { type: "boolean" },
            landmarks: { type: "array", items: { type: "string" } },
            trafficImpact: { type: "string" },
            highAccidentArea: { type: "boolean" },
            populationDensity: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
          },
          required: [
            "district",
            "nearestGovernmentOffice",
            "nearSchoolZone",
            "nearHospital",
            "nearEmergencyRoute",
            "onPublicProperty",
            "landmarks",
            "trafficImpact",
            "highAccidentArea",
            "populationDensity",
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
    console.error("[Location Analysis] Error parsing response:", error);
    throw error;
  }
}

/**
 * Suggest landmarks for easier reporting
 */
export async function suggestLandmarks(
  latitude: string,
  longitude: string,
  description: string
): Promise<string[]> {
  const prompt = `Suggest nearby landmarks that could help someone locate this problem:

Location: ${latitude}, ${longitude}
Problem: ${description}

List 3-5 nearby landmarks (buildings, intersections, parks, etc.) that would help someone find this location.
Respond with JSON:
{
  "landmarks": ["landmark1", "landmark2", "landmark3"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a geography and navigation expert.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "landmarks",
        strict: true,
        schema: {
          type: "object",
          properties: {
            landmarks: { type: "array", items: { type: "string" } },
          },
          required: ["landmarks"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.landmarks;
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("[Landmarks] Error parsing response:", error);
    return [];
  }
}

/**
 * Estimate population affected by the problem
 */
export async function estimateAffectedPopulation(
  latitude: string,
  longitude: string,
  category: string,
  description: string
): Promise<string> {
  const prompt = `Estimate the population affected by this urban problem:

Location: ${latitude}, ${longitude}
Category: ${category}
Description: ${description}

Consider population density, type of problem, and area of impact.
Respond with a single sentence estimate like "Approximately 500-1000 residents" or "Affects major commute route for ~5000 daily users".`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an urban planning expert. Provide realistic population impact estimates.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Predict traffic impact
 */
export async function predictTrafficImpact(
  latitude: string,
  longitude: string,
  category: string
): Promise<string> {
  const prompt = `Predict the traffic impact of this urban problem:

Location: ${latitude}, ${longitude}
Category: ${category}

Consider the type of problem, location type (residential/commercial/highway), and time of day impacts.
Provide a brief assessment of traffic impact.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a traffic engineering expert.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Detect if location is in a high accident area
 */
export async function detectHighAccidentArea(
  latitude: string,
  longitude: string
): Promise<boolean> {
  const prompt = `Is this location in a known high accident area?

Location: ${latitude}, ${longitude}

Respond with JSON:
{
  "isHighAccidentArea": boolean,
  "reason": "explanation"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a traffic safety expert.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "accident_area",
        strict: true,
        schema: {
          type: "object",
          properties: {
            isHighAccidentArea: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["isHighAccidentArea", "reason"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.isHighAccidentArea;
    }
    return false;
  } catch (error) {
    console.error("[Accident Area] Error parsing response:", error);
    return false;
  }
}
