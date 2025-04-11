import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Startup } from "@shared/schema";
import { AIAnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { geminiAI } from "@/lib/gemini-ai";
import { BrainCircuit, Lightbulb, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, BarChart2 } from "lucide-react";

interface PitchAnalyzerProps {
  startup: Startup;
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
}

export default function PitchAnalyzer({ startup, onAnalysisComplete }: PitchAnalyzerProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing AI feedback if available
  const { data: existingFeedback, isLoading: isLoadingFeedback } = useQuery<AIAnalysisResult>({
    queryKey: [`/api/startups/${startup.id}/ai-feedback`],
  });

  // Mutation to save AI feedback
  const saveFeedbackMutation = useMutation({
    mutationFn: async (analysis: AIAnalysisResult) => {
      return apiRequest(`/api/ai-feedback`, "POST", {
        startupId: startup.id,
        feedback: analysis,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startup.id}/ai-feedback`] });
      toast({
        title: "Analysis Saved",
        description: "AI pitch analysis has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the pitch analysis.",
        variant: "destructive",
      });
    },
  });

  const analyzePitch = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare data for analysis (only use fields that exist in the Startup type)
      const pitchData = {
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        industry: startup.industry,
        fundingStage: startup.fundingStage,
        fundingNeeded: startup.fundingNeeded
      };

      // Get analysis from Gemini AI
      const analysis = await geminiAI.analyzePitch(pitchData);
      console.log("AI Analysis Result:", analysis);
      
      // Save analysis
      await saveFeedbackMutation.mutateAsync(analysis);
      console.log('crossed ')
      
      // Call completion handler
      if (onAnalysisComplete) {
        console.log("camp", analysis);
        onAnalysisComplete(analysis);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your pitch has been analyzed by AI.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your pitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Display loading state
  if (isLoadingFeedback) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center py-8">
            <BrainCircuit className="w-12 h-12 text-primary mb-4 animate-pulse" />
            <h3 className="text-xl font-medium mb-2">Analyzing Your Pitch</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Our AI is analyzing your pitch details to provide insights and suggestions on how to improve.
            </p>
            <div className="w-full max-w-md mb-2">
              <Progress value={55} className="h-2" />
            </div>
            <p className="text-sm text-gray-500">This may take a moment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingFeedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Pitch Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div>
              <h3 className="text-lg font-medium mb-2">Overall Score</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Pitch Quality</span>
                  <span className="font-bold text-xl">{existingFeedback.overallScore}/10</span>
                </div>
                <Progress 
                  value={existingFeedback.overallScore * 10} 
                  className="h-2 mb-4"
                />
                <div className="text-gray-700">
                  <Lightbulb className="inline-block mr-2 h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Suggestion: </span>
                  {existingFeedback.suggestion}
                </div>
              </div>
            </div>
            
            {/* Pitch Metrics */}
            <div>
              <h3 className="text-lg font-medium mb-2">Detailed Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Clarity</h4>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={existingFeedback.clarity * 10} 
                      className="h-2 w-3/4"
                    />
                    <span className="font-bold">{existingFeedback.clarity}/10</span>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Market Need</h4>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={existingFeedback.marketNeed * 10} 
                      className="h-2 w-3/4"
                    />
                    <span className="font-bold">{existingFeedback.marketNeed}/10</span>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Team Strength</h4>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={existingFeedback.teamStrength * 10} 
                      className="h-2 w-3/4"
                    />
                    <span className="font-bold">{existingFeedback.teamStrength}/10</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SWOT Analysis */}
            <div>
              <h3 className="text-lg font-medium mb-2">SWOT Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-800 flex items-center mb-2">
                    <ArrowUp className="mr-2 h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {existingFeedback.swotAnalysis.strengths.map((item, idx) => (
                      <li key={idx} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-800 flex items-center mb-2">
                    <ArrowDown className="mr-2 h-4 w-4 text-red-600" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {existingFeedback.swotAnalysis.weaknesses.map((item, idx) => (
                      <li key={idx} className="text-sm text-red-700 flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 flex items-center mb-2">
                    <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                    Opportunities
                  </h4>
                  <ul className="space-y-1">
                    {existingFeedback.swotAnalysis.opportunities.map((item, idx) => (
                      <li key={idx} className="text-sm text-blue-700 flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="font-medium text-amber-800 flex items-center mb-2">
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                    Threats
                  </h4>
                  <ul className="space-y-1">
                    {existingFeedback.swotAnalysis.threats.map((item, idx) => (
                      <li key={idx} className="text-sm text-amber-700 flex items-start">
                        <span className="text-amber-500 mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="mr-2"
                onClick={analyzePitch}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Reanalyze Pitch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Pitch Analyzer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <BrainCircuit className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Analyze Your Pitch with AI</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Our AI will analyze your pitch and provide detailed feedback on its strengths, weaknesses, and suggestions for improvement.
          </p>
          <div className="flex flex-col space-y-4 max-w-md mx-auto">
            <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
              <p className="flex items-start">
                <Lightbulb className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  The analysis will include an overall score, detailed metrics, a SWOT analysis, and actionable recommendations.
                </span>
              </p>
            </div>
            <Button 
              size="lg"
              onClick={analyzePitch}
              className="mx-auto"
            >
              <BrainCircuit className="mr-2 h-5 w-5" />
              Analyze My Pitch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}