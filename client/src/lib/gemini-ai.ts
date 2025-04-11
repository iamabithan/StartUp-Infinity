import { AIAnalysisResult } from "./types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing Gemini API key - please set VITE_GEMINI_API_KEY in .env file");
  throw new Error("Gemini API key not configured");
}

export class GeminiAIClient {
  private async generateContent(prompt: string) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    console.log({response});

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const responseBody = await response.json();
    console.log("Gemini API response:", responseBody);
    return responseBody;
  }

  async analyzePitch(pitchData: any): Promise<AIAnalysisResult> {
    try {
      const prompt = `
      Analyze this startup pitch for "${pitchData.name}":
      Tagline: ${pitchData.tagline}
      Description: ${pitchData.description || "Not provided"}
      Industry: ${pitchData.industry || "Not specified"}
      
      Provide analysis in STRICT JSON format with ALL of these REQUIRED fields:
      {
        "clarity": number (1-10),
        "marketNeed": number (1-10),
        "teamStrength": number (1-10),
        "overallScore": number (1-10),
        "suggestion": string,
        "swotAnalysis": {
          "strengths": string[],
          "weaknesses": string[],
          "opportunities": string[],
          "threats": string[]
        }
      }
      
      The response MUST include all fields and be valid JSON.
      `;

      const response = await this.generateContent(prompt);
      console.log("Gemini API response:", response);
      
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log("All Clear");
        return this.parseGeminiResponse(response.candidates[0].content.parts[0].text);
      }
      return this.parseGeminiResponse(JSON.stringify(response));
    } catch (error) {
      console.error("Error analyzing pitch:", error);
      throw error;
    }
  }

  async generateSWOT(pitchData: any) {
    try {
      const prompt = `Generate SWOT analysis for ${pitchData.name}...`; // Your SWOT prompt
      const response = await this.generateContent(prompt);
      return this.parseGeminiResponse(response.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("Error generating SWOT:", error);
      throw error;
    }
  }

  async matchStartupsToInvestor(investorProfile: any, startups: any[]) {
    try {
      const prompt = `Match startups to investor...`; // Your matching prompt
      const response = await this.generateContent(prompt);
      return this.parseGeminiResponse(response.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("Error matching startups:", error);
      throw error;
    }
  }

  private parseGeminiResponse(response: string): AIAnalysisResult {
    console.log({response});
    try {
      let parsed: any;
      
      // Handle case where response is already an object
      if (typeof response === 'object') {
        parsed = response;
      } 
      // Try extracting JSON from code blocks first
      else if (response.match(/```(?:json)?\n([\s\S]*?)\n```/)) {
        parsed = JSON.parse(response.match(/```(?:json)?\n([\s\S]*?)\n```/)![1].trim());
      }
      // Then try extracting raw JSON
      else if (response.match(/\{[\s\S]*?\}(?=\s*$)/) || response.match(/\[[\s\S]*?\](?=\s*$)/)) {
        parsed = JSON.parse((response.match(/\{[\s\S]*?\}(?=\s*$)/) || response.match(/\[[\s\S]*?\](?=\s*$)/))![0]);
      }
      // Try parsing the whole response as JSON
      else {
        parsed = JSON.parse(response);
      }

      // Provide defaults for missing required fields
      const clarity = Number(parsed.clarity ?? 5);
      const marketNeed = Number(parsed.marketNeed ?? 5);
      const teamStrength = Number(parsed.teamStrength ?? 5);
      const overallScore = Number(
        parsed.overallScore ?? 
        ((clarity + marketNeed + teamStrength) / 3)
      );

      const result: AIAnalysisResult = {
        clarity,
        marketNeed,
        teamStrength,
        overallScore,
        suggestion: parsed.suggestion?.toString() || 'No suggestions provided',
        swotAnalysis: parsed.swotAnalysis || {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      };

      console.log('Parsed analysis result:', result);
      return result;
    } catch (error: unknown) {
      console.error('Failed to parse Gemini response:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while parsing response';
      throw new Error(`Failed to parse AI response. Please try again. Technical details: ${errorMessage}`);
    }
  }
}

export const geminiAI = new GeminiAIClient();
