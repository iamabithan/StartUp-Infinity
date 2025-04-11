export interface AIAnalysisResult {
  // Scores
  clarity: number;
  marketNeed: number;
  teamStrength: number;
  
  // Overall metrics
  overallScore: number;
  suggestion: string;
  
  // SWOT Analysis
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface AIRecommendation {
  startupId: number;
  matchPercentage: number;
  matchReasons?: string[];
}