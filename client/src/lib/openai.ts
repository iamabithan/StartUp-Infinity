import OpenAI from "openai";
import { AIAnalysisResult } from "./types";

// Initialize the OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage (in production, this should be handled by a backend proxy)
});

/**
 * Analyzes a startup pitch and returns an AI analysis result
 */
export async function analyzePitch(pitchData: any): Promise<AIAnalysisResult> {
  try {
    // Construct a prompt for the pitch analysis
    const prompt = `
    I need you to analyze a startup pitch and provide structured feedback. 
    The pitch is for a startup called "${pitchData.name}" with the tagline: "${pitchData.tagline}".
    
    Here are the details:
    - Description: ${pitchData.description || "Not provided"}
    - Industry: ${pitchData.industry || "Not specified"}
    - Funding stage: ${pitchData.fundingStage || "Not specified"}
    - Funding needed: ${pitchData.fundingNeeded ? '$' + pitchData.fundingNeeded.toLocaleString() : "Not specified"}
    ${pitchData.problem ? `- Problem solved: ${pitchData.problem}` : ""}
    ${pitchData.solution ? `- Solution offered: ${pitchData.solution}` : ""}
    ${pitchData.targetMarket ? `- Target market: ${pitchData.targetMarket}` : ""}
    ${pitchData.businessModel ? `- Business model: ${pitchData.businessModel}` : ""}
    ${pitchData.competition ? `- Competition: ${pitchData.competition}` : ""}
    
    Please provide your analysis in a structured JSON format with the following elements:
    1. Clarity score (1-10): How clear is the pitch in explaining what the startup does
    2. Market need score (1-10): How well does it articulate the problem and market need
    3. Team strength score (1-10): Based on the pitch, how strong does the team appear
    4. Overall score (1-10): Overall assessment of the pitch quality
    5. Suggestion: A brief, actionable suggestion to improve the pitch
    6. SWOT analysis: With strengths, weaknesses, opportunities, and threats as arrays of strings
    
    Return ONLY valid JSON in this exact format:
    {
      "clarity": number,
      "marketNeed": number,
      "teamStrength": number,
      "overallScore": number,
      "suggestion": "string",
      "swotAnalysis": {
        "strengths": ["string", "string", ...],
        "weaknesses": ["string", "string", ...],
        "opportunities": ["string", "string", ...],
        "threats": ["string", "string", ...]
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert startup pitch analyst with experience in venture capital and entrepreneurship." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No analysis received from OpenAI");
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText) as AIAnalysisResult;
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing pitch with OpenAI:", error);
    
    // Return a fallback analysis in case of error
    return {
      clarity: 5,
      marketNeed: 5,
      teamStrength: 5,
      overallScore: 5,
      suggestion: "We couldn't analyze your pitch. Please try again later or contact support.",
      swotAnalysis: {
        strengths: ["Unable to analyze strengths at this time"],
        weaknesses: ["Unable to analyze weaknesses at this time"],
        opportunities: ["Unable to analyze opportunities at this time"],
        threats: ["Unable to analyze threats at this time"]
      }
    };
  }
}

/**
 * Generates a SWOT analysis for a startup
 */
export async function generateSWOT(pitchData: any): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}> {
  try {
    const prompt = `
    Generate a detailed SWOT analysis for the following startup:
    
    Startup: ${pitchData.name}
    Tagline: ${pitchData.tagline}
    Description: ${pitchData.description || "Not provided"}
    Industry: ${pitchData.industry || "Not specified"}
    
    Provide the analysis in JSON format with the following structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "weaknesses": ["weakness1", "weakness2", ...],
      "opportunities": ["opportunity1", "opportunity2", ...],
      "threats": ["threat1", "threat2", ...]
    }
    
    Aim for 3-5 points in each category, each written concisely.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a business analyst specializing in startup evaluation and market analysis." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const swotText = response.choices[0].message.content;
    if (!swotText) {
      throw new Error("No SWOT analysis received from OpenAI");
    }

    // Parse the JSON response
    const swot = JSON.parse(swotText) as {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    
    return swot;
  } catch (error) {
    console.error("Error generating SWOT with OpenAI:", error);
    
    // Return a fallback analysis
    return {
      strengths: ["Unable to analyze strengths at this time"],
      weaknesses: ["Unable to analyze weaknesses at this time"],
      opportunities: ["Unable to analyze opportunities at this time"],
      threats: ["Unable to analyze threats at this time"]
    };
  }
}

/**
 * Matches investors with a startup based on pitch data
 */
export async function matchInvestorsToStartup(
  pitchData: any,
  count: number = 3
): Promise<any[]> {
  try {
    const prompt = `
    As an AI investment matcher, suggest ${count} potential investor types/personas who would be most interested in this startup:
    
    Startup: ${pitchData.name}
    Tagline: ${pitchData.tagline}
    Description: ${pitchData.description || "Not provided"}
    Industry: ${pitchData.industry || "Not specified"}
    Funding Stage: ${pitchData.fundingStage || "Not specified"}
    Funding Needed: ${pitchData.fundingNeeded ? '$' + pitchData.fundingNeeded.toLocaleString() : "Not specified"}
    
    For each investor, provide:
    1. A match percentage (70-100%)
    2. 2-3 reasons for the match
    3. A fictional but realistic investor profile
    
    Return the analysis as a JSON array in this exact format:
    [
      {
        "investorId": 101,
        "matchPercentage": 85,
        "matchReasons": ["reason1", "reason2", "reason3"],
        "investorProfile": {
          "name": "Example Ventures",
          "focus": ["Industry1", "Industry2"],
          "stage": "Series A",
          "investmentRange": "$1M - $5M"
        }
      },
      ...
    ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert in matching startups with ideal investors based on industry, stage, and business model." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const matchesText = response.choices[0].message.content;
    if (!matchesText) {
      throw new Error("No investor matches received from OpenAI");
    }

    // Parse the JSON response
    const matches = JSON.parse(matchesText);
    
    return matches;
  } catch (error) {
    console.error("Error matching investors with OpenAI:", error);
    
    // Return a fallback response
    return [
      {
        investorId: 101,
        matchPercentage: 75,
        matchReasons: ["Matching error occurred", "Please try again later"],
        investorProfile: {
          name: "Generic Investor",
          focus: [pitchData.industry || "Technology"],
          stage: pitchData.fundingStage || "Seed",
          investmentRange: "$100K - $1M"
        }
      }
    ];
  }
}

export const openaiClient = {
  analyzePitch,
  generateSWOT,
  matchInvestorsToStartup
};