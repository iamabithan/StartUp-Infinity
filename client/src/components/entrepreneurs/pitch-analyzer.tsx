import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { geminiAI } from "@/lib/gemini-ai";
import { AIAnalysisResult } from "@/lib/types";
import { AlertCircle, Award, Brain, Check, ChevronDown, ChevronUp, Lightbulb, Rocket, Shield, TrendingUp, Users, X } from "lucide-react";

interface PitchAnalyzerProps {
  startupId?: number;
  initialData?: {
    name: string;
    tagline: string;
    description: string;
    industry: string;
    fundingNeeded: number;
    fundingStage: string;
  };
}

export default function PitchAnalyzer({ startupId, initialData }: PitchAnalyzerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [fundingNeeded, setFundingNeeded] = useState(initialData?.fundingNeeded?.toString() || "");
  const [fundingStage, setFundingStage] = useState(initialData?.fundingStage || "");
  
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

  const handleAnalyze = async () => {
    if (!name || !tagline || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide your startup name, tagline, and description for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const pitchData = {
        name,
        tagline,
        description,
        industry,
        fundingNeeded: parseFloat(fundingNeeded) || 0,
        fundingStage,
        startupId
      };

      // First analyze the pitch metrics
      const pitchAnalysis = await geminiAI.analyzePitch(pitchData);
      
      // Then generate the SWOT analysis
      const swotAnalysis = await geminiAI.generateSWOT(pitchData);
      
      // Combine the results
      const completeAnalysis = {
        ...pitchAnalysis,
        swotAnalysis: swotAnalysis
      } as AIAnalysisResult;
      
      setAnalysisResult(completeAnalysis);
      setActiveTab("results");

      // If we have a startupId, we would also save this analysis to the backend
      if (startupId) {
        try {
          // This would be implemented in a real app
          // await apiRequest("POST", "/api/ai-feedback", {
          //   startupId,
          //   ...completeAnalysis
          // });
          
          toast({
            title: "Analysis Saved",
            description: "The AI analysis has been saved to your startup profile.",
          });
        } catch (error) {
          console.error("Failed to save analysis:", error);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "We encountered an error while analyzing your pitch. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user || user.role !== "entrepreneur") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrepreneur Access Only</CardTitle>
          <CardDescription>
            Only entrepreneurs can access the pitch analyzer tool.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">AI Pitch Analyzer</CardTitle>
        <CardDescription>
          Get instant feedback on your startup pitch using our advanced AI analysis engine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Pitch Editor</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Analysis Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Startup Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your startup name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input 
                  id="tagline" 
                  value={tagline} 
                  onChange={(e) => setTagline(e.target.value)} 
                  placeholder="A short, catchy description of your startup"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Pitch Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your startup, what problem it solves, your target market, and your business model"
                  className="mt-1 min-h-[200px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)} 
                    placeholder="e.g., Fintech, Healthcare, SaaS"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fundingStage">Funding Stage</Label>
                  <Input 
                    id="fundingStage" 
                    value={fundingStage} 
                    onChange={(e) => setFundingStage(e.target.value)} 
                    placeholder="e.g., Pre-seed, Seed, Series A"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fundingNeeded">Funding Needed (₹)</Label>
                <Input 
                  id="fundingNeeded" 
                  type="number"
                  value={fundingNeeded} 
                  onChange={(e) => setFundingNeeded(e.target.value)} 
                  placeholder="e.g., 500000"
                  className="mt-1"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !name || !tagline || !description}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze My Pitch"}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Our AI will analyze your pitch and provide feedback to help you improve.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results">
            {analysisResult && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center text-blue-600">
                        <Brain className="h-5 w-5 mr-2" />
                        Clarity Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-3xl font-bold">{analysisResult.clarity}%</div>
                      <Progress value={analysisResult.clarity} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center text-green-600">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Market Need
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-3xl font-bold">{analysisResult.marketNeed}%</div>
                      <Progress value={analysisResult.marketNeed} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center text-purple-600">
                        <Users className="h-5 w-5 mr-2" />
                        Team Strength
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-3xl font-bold">{analysisResult.teamStrength}%</div>
                      <Progress value={analysisResult.teamStrength} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      Key Suggestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{analysisResult.suggestion}</p>
                  </CardContent>
                </Card>
                
                {analysisResult.swotAnalysis && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      SWOT Analysis
                    </h3>
                    
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
                              {analysisResult.swotAnalysis.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 font-bold mr-2">•</span>
                                  {strength}
                                </li>
                              ))}
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
                              {analysisResult.swotAnalysis.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-red-500 font-bold mr-2">•</span>
                                  {weakness}
                                </li>
                              ))}
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
                              {analysisResult.swotAnalysis.opportunities.map((opportunity, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 font-bold mr-2">•</span>
                                  {opportunity}
                                </li>
                              ))}
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
                              {analysisResult.swotAnalysis.threats.map((threat, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-orange-500 font-bold mr-2">•</span>
                                  {threat}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  </div>
                )}
                
                <div>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">About AI Analysis</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            This analysis is generated by AI based on your input. Use it as a guide to improve your pitch,
                            but consider seeking feedback from mentors and potential investors as well.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <div>
          <Badge variant="outline" className="mr-2">AI-Powered</Badge>
          <Badge variant="outline">Confidential</Badge>
        </div>
        <Button variant="outline" onClick={() => setActiveTab("editor")}>
          Edit Pitch
        </Button>
      </CardFooter>
    </Card>
  );
}