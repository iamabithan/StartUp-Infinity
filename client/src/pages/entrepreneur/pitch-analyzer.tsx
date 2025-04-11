import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import { Startup } from "@shared/schema";
import { AIAnalysisResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PitchAnalyzer from "@/components/pitch/pitch-analyzer";
import { Brain, HelpCircle, Info, Star } from "lucide-react";

export default function PitchAnalyzerPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<number, AIAnalysisResult>>({});

  // Fetch user's startups
  const { data: startups = [], isLoading: isLoadingStartups } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user && user.role === "entrepreneur",
  });

  // Set first startup as selected by default when data loads
  if (startups.length > 0 && !selectedStartupId) {
    setSelectedStartupId(startups[0].id);
  }

  const handleAnalysisComplete = (startupId: number, analysis: AIAnalysisResult) => {
    setAnalysisResults(prev => ({
      ...prev,
      [startupId]: analysis
    }));
  };

  if (!user || user.role !== "entrepreneur") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Entrepreneur Access Only</h2>
          <p className="mt-2 text-gray-600">This page is only accessible to entrepreneurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <EntrepreneurSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Pitch Analyzer</h1>
                    <p className="mt-1 text-sm text-gray-600">Get AI-powered analysis and feedback on your startup pitches</p>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {isLoadingStartups ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : startups.length === 0 ? (
                  <Card className="bg-white p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Startups Created</h3>
                    <p className="text-gray-500 mt-2 mb-6">
                      You haven't created any startups yet. Create a startup to analyze your pitch with AI.
                    </p>
                  </Card>
                ) : (
                  <>
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Info className="h-5 w-5 mr-2 text-blue-500" />
                          How Pitch Analysis Works
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-700 space-y-2">
                          <p>
                            Our AI-powered pitch analyzer evaluates your startup pitch and provides detailed feedback to help you improve:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Get objective scoring on clarity, market need, and team strength</li>
                            <li>Receive a comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)</li>
                            <li>Get actionable suggestions to improve your pitch and appeal to investors</li>
                            <li>Understand how investors might perceive your business proposition</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Tabs 
                      value={selectedStartupId?.toString() || ""} 
                      onValueChange={(value) => setSelectedStartupId(parseInt(value))}
                    >
                      <div className="border-b mb-4">
                        <TabsList className="w-full justify-start space-x-2">
                          {startups.map(startup => (
                            <TabsTrigger 
                              key={startup.id} 
                              value={startup.id.toString()}
                              className="flex items-center"
                            >
                              {startup.name}
                              {analysisResults[startup.id] && (
                                <Star className="ml-2 h-3 w-3 text-yellow-500 fill-yellow-500" />
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      {startups.map(startup => (
                        <TabsContent key={startup.id} value={startup.id.toString()}>
                          <div className="mb-4">
                            <h2 className="text-xl font-semibold">{startup.name}</h2>
                            <p className="text-gray-600">{startup.tagline}</p>
                          </div>
                          
                          <PitchAnalyzer 
                            startup={startup} 
                            onAnalysisComplete={(analysis) => handleAnalysisComplete(startup.id, analysis)}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}