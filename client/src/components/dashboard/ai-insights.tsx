import { useState, useMemo } from "react";
import { AiFeedback } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, X, Lightbulb, Rocket, Shield, Brain, TrendingUp, Users } from "lucide-react";

interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// Extended feedback type that includes SWOT analysis properly typed
interface ExtendedAIFeedback extends AiFeedback {
  swotAnalysis: SWOTAnalysis;
}

interface AIInsightsProps {
  feedback: AiFeedback;
  startupId: number;
}

export default function AIInsights({ feedback, startupId }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate overall score based on the three main metrics
  const overallScore = useMemo(() => {
    if (!feedback) return 0;
    const { clarity = 0, marketNeed = 0, teamStrength = 0 } = feedback;
    return Math.round((clarity + marketNeed + teamStrength) / 3);
  }, [feedback]);
  
  // Parse the SWOT analysis from the JSON field
  const swotData = useMemo<SWOTAnalysis>(() => {
    if (!feedback?.swotAnalysis) {
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
    }
    
    try {
      // If swotAnalysis is a string (JSON), parse it
      if (typeof feedback.swotAnalysis === 'string') {
        return JSON.parse(feedback.swotAnalysis);
      }
      // If it's already an object, use it directly
      return feedback.swotAnalysis as SWOTAnalysis;
    } catch (error) {
      console.error("Error parsing SWOT analysis:", error);
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      } as SWOTAnalysis;
    }
  }, [feedback]);
  
  // SWOT display toggles
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: true,
    opportunities: true,
    threats: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  if (!feedback) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No AI Analysis Available</h3>
        <p className="text-gray-500 mt-2">This startup hasn't been analyzed by our AI yet.</p>
      </div>
    );
  }
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center text-blue-600">
                    <Brain className="h-5 w-5 mr-2" />
                    Clarity Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4">
                  <div className="text-3xl font-bold">{feedback.clarity || 0}%</div>
                  <Progress value={feedback.clarity || 0} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center text-green-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Market Need
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4">
                  <div className="text-3xl font-bold">{feedback.marketNeed || 0}%</div>
                  <Progress value={feedback.marketNeed || 0} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center text-purple-600">
                    <Users className="h-5 w-5 mr-2" />
                    Team Strength
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4">
                  <div className="text-3xl font-bold">{feedback.teamStrength || 0}%</div>
                  <Progress value={feedback.teamStrength || 0} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                  Key AI Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{feedback.suggestion || "No suggestion available."}</p>
              </CardContent>
            </Card>
            
            <div className="mb-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle>Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="text-center mb-4 md:mb-0">
                      <div className="text-5xl font-bold text-primary">{overallScore}%</div>
                      <div className="text-sm text-gray-500 mt-1">Overall Score</div>
                    </div>
                    
                    <div className="flex-1">
                      <Progress 
                        value={overallScore} 
                        className="h-4 mb-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      
                      <div className="mt-4">
                        {overallScore >= 80 ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Outstanding
                          </Badge>
                        ) : overallScore >= 65 ? (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Strong
                          </Badge>
                        ) : overallScore >= 50 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            Promising
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                            Needs Improvement
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-right mt-4">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("swot")}>
                View SWOT Analysis
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="swot">
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('strengths')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      Strengths
                    </CardTitle>
                    {expandedSections.strengths ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.strengths && (
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {swotData.strengths.length > 0 ? (
                        swotData.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 font-bold mr-2">•</span>
                            {strength}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No strengths identified.</li>
                      )}
                    </ul>
                  </CardContent>
                )}
              </Card>
              
              {/* Weaknesses */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('weaknesses')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center text-red-600">
                      <X className="h-5 w-5 mr-2" />
                      Weaknesses
                    </CardTitle>
                    {expandedSections.weaknesses ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.weaknesses && (
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {swotData.weaknesses.length > 0 ? (
                        swotData.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 font-bold mr-2">•</span>
                            {weakness}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No weaknesses identified.</li>
                      )}
                    </ul>
                  </CardContent>
                )}
              </Card>
              
              {/* Opportunities */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('opportunities')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center text-blue-600">
                      <Rocket className="h-5 w-5 mr-2" />
                      Opportunities
                    </CardTitle>
                    {expandedSections.opportunities ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.opportunities && (
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {swotData.opportunities.length > 0 ? (
                        swotData.opportunities.map((opportunity, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 font-bold mr-2">•</span>
                            {opportunity}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No opportunities identified.</li>
                      )}
                    </ul>
                  </CardContent>
                )}
              </Card>
              
              {/* Threats */}
              <Card>
                <CardHeader className="py-4 cursor-pointer" onClick={() => toggleSection('threats')}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center text-orange-600">
                      <Shield className="h-5 w-5 mr-2" />
                      Threats
                    </CardTitle>
                    {expandedSections.threats ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.threats && (
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {swotData.threats.length > 0 ? (
                        swotData.threats.map((threat, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-orange-500 font-bold mr-2">•</span>
                            {threat}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No threats identified.</li>
                      )}
                    </ul>
                  </CardContent>
                )}
              </Card>
            </div>
            
            <div className="text-right mt-4">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("overview")}>
                Back to Overview
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}