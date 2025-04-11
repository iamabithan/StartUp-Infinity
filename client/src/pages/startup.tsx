import { useState } from "react";
import { useLocation, Link as WouterLink } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AiFeedback, Interest, Startup, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AIInsights from "@/components/dashboard/ai-insights";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookmarkIcon, Calendar, DollarSign, Globe, Link2, MapPin, Target, Users } from "lucide-react";

export default function StartupDetails() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  // Extract ID from URL path
  const startupId = parseInt(location.split('/').pop() || '0');
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Fetch startup details
  const { data: startup, isLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
    enabled: !!startupId,
  });
  
  // Fetch AI feedback if available
  const { data: aiFeedback } = useQuery<AiFeedback>({
    queryKey: [`/api/startups/${startupId}/ai-feedback`],
    enabled: !!startupId,
  });
  
  // Fetch startup interests
  const { data: interests = [] } = useQuery<Interest[]>({
    queryKey: [`/api/startups/${startupId}/interests`],
    enabled: !!startupId,
  });
  
  // Check if user has already expressed interest
  const userInterest = user ? interests.find(interest => interest.investorId === user.id) : undefined;
  
  // Fetch startup owner details
  const { data: startupOwner } = useQuery<User>({
    queryKey: startup ? [`/api/users/${startup.userId}`] : [],
    enabled: !!startup,
  });
  
  if (isLoading || !startup) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleExpressionOfInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to express interest in startups.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== "investor") {
      toast({
        title: "Action Not Available",
        description: "Only investors can express interest in startups.",
        variant: "destructive"
      });
      return;
    }
    
    if (userInterest) {
      toast({
        title: "Already Interested",
        description: "You have already expressed interest in this startup."
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/interests", {
        investorId: user.id,
        startupId: startup.id,
        notes: "Expressed interest from startup details page"
      });
      
      toast({
        title: "Interest Recorded",
        description: "You have successfully expressed interest in this startup."
      });
      
      // In a real app, we would invalidate the query to refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to record your interest. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitFeedback = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to provide feedback.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== "investor") {
      toast({
        title: "Action Not Available",
        description: "Only investors can provide feedback.",
        variant: "destructive"
      });
      return;
    }
    
    if (!feedbackText.trim()) {
      toast({
        title: "Empty Feedback",
        description: "Please enter your feedback before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmittingFeedback(true);
    
    try {
      // If user already has an interest, update it with feedback
      if (userInterest) {
        await apiRequest("PATCH", `/api/interests/${userInterest.id}`, {
          feedback: feedbackText
        });
      } else {
        // Otherwise create a new interest with feedback
        await apiRequest("POST", "/api/interests", {
          investorId: user.id,
          startupId: startup.id,
          notes: "Feedback provided",
          feedback: feedbackText
        });
      }
      
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been sent to the startup founder."
      });
      
      setFeedbackText("");
      
      // In a real app, we would invalidate the query to refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  const formatTeamMember = (member: any) => {
    return `${member.name} - ${member.role}${member.bio ? ` (${member.bio})` : ''}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <WouterLink href={user?.role === "investor" ? "/browse-startups" : "/my-pitches"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {user?.role === "investor" ? "Browse" : "My Pitches"}
            </Button>
          </WouterLink>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{startup.name}</h1>
              <p className="mt-1 text-xl text-gray-600">{startup.tagline}</p>
            </div>
            {user?.role === "investor" && (
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button
                  variant={userInterest ? "secondary" : "default"}
                  onClick={handleExpressionOfInterest}
                >
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  {userInterest ? "Interested" : "Express Interest"}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main Content */}
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="team">Target</TabsTrigger>
                {aiFeedback && <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>}
                {user?.role === "investor" && <TabsTrigger value="feedback">Provide Feedback</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-3 mb-6">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {startup.fundingStage}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                        {startup.industry}
                      </Badge>
                      {startup.tags && startup.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {startup.location && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-700">{startup.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700">${(startup.fundingNeeded / 1000).toFixed(0)}K funding needed</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700">
                          Founded {new Date(startup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {startup.website && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <Globe className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-medium">Website</h3>
                        </div>
                        <a
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {startup.website}
                          <Link2 className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{startup.description}</p>
                    </div>
                    
                    {startup.pitchDeck && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Pitch Deck</h3>
                        <a
                          href={startup.pitchDeck}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          View Pitch Deck
                          <Link2 className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    {startup.pitchVideo && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Pitch Video</h3>
                        <a
                          href={startup.pitchVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Watch Pitch Video
                          <Link2 className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle>Target Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(startup.teamMembers) && startup.teamMembers.map((member: any, idx: number) => (
                        <div key={idx} className="flex p-4 border rounded-md">
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-4">
                            {member?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h4 className="font-medium">{member?.name || "Unknown"}</h4>
                            <p className="text-gray-500">{member?.role || "Team Member"}</p>
                            {member?.bio && <p className="text-sm text-gray-600 mt-1">{member.bio}</p>}
                          </div>
                        </div>
                      ))}
                      
                      {(!startup.teamMembers || !Array.isArray(startup.teamMembers) || startup.teamMembers.length === 0) && (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          No team members listed for this startup.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {aiFeedback && (
                <TabsContent value="ai-insights">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AIInsights feedback={aiFeedback} startupId={startup.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {user?.role === "investor" && (
                <TabsContent value="feedback">
                  <Card>
                    <CardHeader>
                      <CardTitle>Provide Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Share your thoughts, suggestions, or questions with the startup founder. Your feedback is valuable for their growth.
                        </p>
                        
                        <Textarea
                          placeholder="Enter your feedback here..."
                          className="min-h-[150px]"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSubmitFeedback}
                            disabled={isSubmittingFeedback || !feedbackText.trim()}
                          >
                            {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          <div>
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Founder</CardTitle>
                </CardHeader>
                <CardContent>
                  {startupOwner ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img 
                          src={startupOwner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(startupOwner.fullName)}&background=random`} 
                          alt={startupOwner.fullName} 
                          className="h-12 w-12 rounded-full"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{startupOwner.fullName}</h3>
                        <p className="text-gray-500">{startupOwner.bio || "Entrepreneur"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Loading founder information...
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interest Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interested Investors</span>
                      <span className="font-semibold">{interests.length}</span>
                    </div>
                    
                    {user?.role === "entrepreneur" && interests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Interest</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {interests.slice(0, 5).map((interest) => (
                            <div key={interest.id} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium">Investor #{interest.investorId}</p>
                              {interest.notes && (
                                <p className="text-xs text-gray-500 mt-1">{interest.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
