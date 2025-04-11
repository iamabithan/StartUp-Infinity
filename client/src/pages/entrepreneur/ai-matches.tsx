import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import { Startup } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BrainCircuit, User, Users, Zap, DollarSign, ArrowRight, UserCheck } from "lucide-react";
import { geminiAI } from "@/lib/gemini-ai";
import { useToast } from "@/hooks/use-toast";

interface InvestorMatch {
  investorId: number;
  matchPercentage: number;
  matchReasons: string[];
  investorProfile: {
    name: string;
    focus: string[];
    stage: string;
    investmentRange: string;
  };
}

export default function AIMatchesPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [investorMatches, setInvestorMatches] = useState<Record<number, InvestorMatch[]>>({});
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);

  // Fetch user's startups
  const { data: startups = [], isLoading: isLoadingStartups } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user && user.role === "entrepreneur",
  });

  useEffect(() => {
    if (startups.length > 0 && !selectedStartupId) {
      setSelectedStartupId(startups[0].id);
    }
  }, [startups, selectedStartupId]);

  const generateMatches = async (startupId: number) => {
    if (!startupId || isGeneratingMatches) return;
    
    setIsGeneratingMatches(true);
    
    try {
      // Find the startup to match
      const startup = startups.find(s => s.id === startupId);
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Simulate AI-generated investor matches
      // In a real application, this would call the Gemini API
      const mockInvestors = [
        {
          investorId: 101,
          matchPercentage: Math.floor(Math.random() * 31) + 70, // 70-100%
          matchReasons: [
            "Investment focus aligns with your industry",
            "Previous investments in similar startups",
            "Looking for companies at your funding stage"
          ],
          investorProfile: {
            name: "Venture Capital Partners",
            focus: ["Technology", "SaaS", startup.industry],
            stage: startup.fundingStage,
            investmentRange: "$250K - $2M"
          }
        },
        {
          investorId: 102,
          matchPercentage: Math.floor(Math.random() * 31) + 70, // 70-100%
          matchReasons: [
            "Interest in your specific market segment",
            "Experience with scaling similar business models",
            "Looking for founders with your background"
          ],
          investorProfile: {
            name: "Growth Equity Fund",
            focus: [startup.industry, "B2B Solutions"],
            stage: startup.fundingStage,
            investmentRange: "$500K - $5M"
          }
        },
        {
          investorId: 103,
          matchPercentage: Math.floor(Math.random() * 31) + 60, // 60-90%
          matchReasons: [
            "Strategic interest in your target market",
            "Complementary portfolio companies",
            "Interest in your technology approach"
          ],
          investorProfile: {
            name: "Innovation Capital",
            focus: ["Industry Innovation", startup.industry],
            stage: "Series A+",
            investmentRange: "$1M - $10M"
          }
        }
      ];
      
      // Sort by match percentage
      mockInvestors.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      // Update matches state
      setInvestorMatches(prev => ({
        ...prev,
        [startupId]: mockInvestors
      }));
      
      toast({
        title: "AI Matches Generated",
        description: `Found ${mockInvestors.length} potential investor matches for ${startup.name}.`,
      });
      
    } catch (error) {
      console.error("Error generating matches:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMatches(false);
    }
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
                    <h1 className="text-2xl font-semibold text-gray-900">AI Investor Matches</h1>
                    <p className="mt-1 text-sm text-gray-600">AI-powered matching with potential investors</p>
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
                      <BrainCircuit className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Startups Created</h3>
                    <p className="text-gray-500 mt-2 mb-6">You haven't created any startups yet, so there are no AI matches to generate.</p>
                  </Card>
                ) : (
                  <>
                    {/* Startup selector tabs */}
                    <Tabs 
                      value={selectedStartupId?.toString() || ""}
                      onValueChange={(value) => setSelectedStartupId(parseInt(value))}
                      className="mb-6"
                    >
                      <div className="border-b mb-4">
                        <TabsList className="w-full justify-start space-x-2">
                          {startups.map(startup => (
                            <TabsTrigger key={startup.id} value={startup.id.toString()}>
                              {startup.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      {startups.map(startup => (
                        <TabsContent key={startup.id} value={startup.id.toString()}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h2 className="text-xl font-semibold">{startup.name}</h2>
                              <p className="text-gray-600">{startup.tagline}</p>
                            </div>
                            <Button 
                              onClick={() => generateMatches(startup.id)}
                              disabled={isGeneratingMatches}
                            >
                              <BrainCircuit className="mr-2 h-4 w-4" />
                              {investorMatches[startup.id] ? "Regenerate Matches" : "Generate Matches"}
                            </Button>
                          </div>
                          
                          {isGeneratingMatches && selectedStartupId === startup.id ? (
                            <Card className="p-6">
                              <div className="flex flex-col items-center justify-center py-8">
                                <BrainCircuit className="h-12 w-12 text-primary mb-4 animate-pulse" />
                                <h3 className="text-lg font-medium mb-2">Generating AI Matches</h3>
                                <p className="text-gray-500 mb-4 text-center max-w-md">
                                  Our AI is analyzing your startup details and identifying the best potential investor matches based on industry, stage, and business model.
                                </p>
                                <div className="w-full max-w-md">
                                  <Progress value={45} className="h-2 mb-2" />
                                </div>
                              </div>
                            </Card>
                          ) : investorMatches[startup.id] ? (
                            <div className="space-y-6">
                              <Card className="bg-blue-50 border-blue-100">
                                <CardContent className="p-4">
                                  <div className="flex items-start">
                                    <BrainCircuit className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                                    <div>
                                      <h3 className="text-blue-800 font-medium">How AI Matching Works</h3>
                                      <p className="text-blue-700 text-sm mt-1">
                                        Our AI analyzes your startup profile and matches it with potential investors based on industry alignment, funding stage, business model, and growth potential. Matches are sorted by compatibility percentage.
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              {investorMatches[startup.id].map((match, idx) => (
                                <Card key={idx} className="overflow-hidden">
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle>{match.investorProfile.name}</CardTitle>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {match.investorProfile.focus.map((focus, i) => (
                                            <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800">
                                              {focus}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <Badge className="bg-primary-100 text-primary-800">
                                        {match.matchPercentage}% Match
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="mb-4">
                                      <div className="flex justify-between mb-1 text-sm">
                                        <span>Match Strength</span>
                                        <span className="font-medium">{match.matchPercentage}%</span>
                                      </div>
                                      <Progress value={match.matchPercentage} className="h-2" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                        <div>
                                          <p className="text-xs text-gray-500">Investment Range</p>
                                          <p className="font-medium">{match.investorProfile.investmentRange}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                        <Zap className="h-5 w-5 text-gray-400 mr-2" />
                                        <div>
                                          <p className="text-xs text-gray-500">Preferred Stage</p>
                                          <p className="font-medium">{match.investorProfile.stage}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                      <h4 className="text-sm font-medium mb-2">Why This Investor May Be Interested:</h4>
                                      <ul className="text-sm text-gray-600 space-y-1">
                                        {match.matchReasons.map((reason, idx) => (
                                          <li key={idx} className="flex items-start">
                                            <span className="text-green-500 mr-1">•</span>
                                            {reason}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                                      <Button variant="outline" size="sm">
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Contact Investor
                                      </Button>
                                      <Button size="sm">
                                        View Full Profile
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <Card className="p-6 text-center">
                              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <BrainCircuit className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">No AI Matches Generated</h3>
                              <p className="text-gray-500 mt-2 mb-6">
                                Generate AI matches to find potential investors that align with your startup's industry, stage, and business model.
                              </p>
                              <div className="flex justify-center">
                                <Button onClick={() => generateMatches(startup.id)}>
                                  <BrainCircuit className="mr-2 h-4 w-4" />
                                  Generate Matches
                                </Button>
                              </div>
                            </Card>
                          )}
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