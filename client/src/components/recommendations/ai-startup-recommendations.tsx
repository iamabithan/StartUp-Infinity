import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Startup } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { geminiAI } from "@/lib/gemini-ai";
import { DollarSign, MapPin, Users, ArrowRight, Award, BrainCircuit } from "lucide-react";
import { Link } from "wouter";

interface AIRecommendation {
  startupId: number;
  matchPercentage: number;
  matchReasons?: string[];
}

export default function AIStartupRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedTab, setSelectedTab] = useState("ai-match");

  // Fetch all startups
  const { data: startups = [], isLoading: startupsLoading } = useQuery<Startup[]>({
    queryKey: ['/api/startups'],
    enabled: !!user && user.role === "investor",
  });

  // Fetch investor interests to show which startups are bookmarked
  const { data: interests = [] } = useQuery<any[]>({
    queryKey: user ? [`/api/investors/${user.id}/interests`] : [],
    enabled: !!user && user.role === "investor",
  });

  // Get the bookmarked startup IDs
  const bookmarkedStartupIds = interests.map(interest => interest.startupId);

  // Format funding needed to user-friendly string (e.g., $500K)
  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
  };

  // Generate AI recommendations when user or startups change
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!user || user.role !== "investor" || !startups.length) return;
      
      setRecommendationsLoading(true);
      
      try {
        // In a real implementation, we'd send the investor profile and startups to the Gemini API
        // For now, we'll use our mock implementation
        const investorProfile = {
          id: user.id,
          interests: ["AI", "Healthcare", "Fintech"],
          investmentPreferences: {
            stages: ["Seed", "Series A"],
            investmentSize: [100000, 500000],
            sectors: ["Technology", "Healthcare"]
          }
        };
        
        const result = await geminiAI.matchStartupsToInvestor(investorProfile, startups);
        
        // Sort by match percentage (descending)
        result.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        // Add mock match reasons for top recommendations
        const enrichedResults = result.map(rec => ({
          ...rec,
          matchReasons: [
            "Industry alignment with your investment history",
            "Growth potential matches your investment goals",
            "Team composition indicates strong execution ability"
          ]
        }));
        
        setRecommendations(enrichedResults);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        toast({
          title: "Recommendation Error",
          description: "Failed to generate startup recommendations. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setRecommendationsLoading(false);
      }
    };

    generateRecommendations();
  }, [user, startups, toast]);

  // Filter startups based on recommendations
  const recommendedStartups = recommendations.map(rec => {
    const startup = startups.find(s => s.id === rec.startupId);
    return { startup, matchPercentage: rec.matchPercentage, matchReasons: rec.matchReasons };
  }).filter(item => item.startup !== undefined);

  if (!user || user.role !== "investor") {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Investor Access Only</h3>
        <p className="text-gray-500 mt-2">Only investors can view AI-powered recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Startup Recommendations</h2>
        <p className="text-gray-600">
          Discover startups that align with your investment preferences and history, powered by advanced matching algorithms.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ai-match">AI Match</TabsTrigger>
          <TabsTrigger value="all">All Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-match">
          <div className="mb-4 p-4 bg-primary-50 border border-primary-100 rounded-md">
            <div className="flex items-start">
              <BrainCircuit className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">How AI Matching Works</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our AI analyzes your investment history, preferences, and startup data to identify the most promising opportunities for you.
                  Match percentages indicate alignment with your investment criteria and potential for success.
                </p>
              </div>
            </div>
          </div>
          
          {(startupsLoading || recommendationsLoading) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="h-40 bg-gray-200">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : recommendedStartups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Recommendations Yet</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                We're still learning about your investment preferences. Browse and interact with more startups to improve recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedStartups.slice(0, 8).map(({ startup, matchPercentage, matchReasons }) => (
                <Card key={startup?.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary-light" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{startup?.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{startup?.tagline}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-primary-50 text-primary">
                        {matchPercentage}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Match Strength</span>
                        <span className="font-medium">{matchPercentage}%</span>
                      </div>
                      <Progress value={matchPercentage} className="h-2" />
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Why We Recommend This:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {matchReasons?.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-primary mr-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <div className="flex space-x-3">
                        {startup?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{startup.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span>{formatFunding(startup?.fundingNeeded || 0)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Team of {startup?.teamMembers ? Object.keys(startup.teamMembers).length : 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link href={`/startup/${startup?.id}`}>
                        <Button className="w-full">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <Card key={startup.id} className="overflow-hidden">
                <div className="h-40 bg-gray-200 relative">
                  <img 
                    src={startup.coverImage || "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=300&q=80"} 
                    alt={`${startup.name} Cover`} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                      {startup.industry}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {startup.fundingStage}
                    </Badge>
                  </div>
                  {bookmarkedStartupIds.includes(startup.id) && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Bookmarked
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{startup.tagline}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{startup.location || "Remote"}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatFunding(startup.fundingNeeded)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/startup/${startup.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}