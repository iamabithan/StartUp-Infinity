import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import { Interest, Startup } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, User, ThumbsUp, BarChart } from "lucide-react";

export default function FeedbackPage() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch user's startups
  const { data: startups = [], isLoading: isLoadingStartups } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user && user.role === "entrepreneur",
  });

  // Fetch all interests (which contain feedback)
  const { data: allInterests = [], isLoading: isLoadingInterests } = useQuery<Interest[]>({
    queryKey: startups.length > 0 ? ['/api/startups/interests'] : [],
    enabled: startups.length > 0,
  });

  // Filter interests that have feedback
  const startupIds = startups.map(startup => startup.id);
  const interestsWithFeedback = allInterests.filter(
    interest => startupIds.includes(interest.startupId) && interest.feedback
  );

  // Group feedback by startup
  const feedbackByStartup = startupIds.map(startupId => {
    const startup = startups.find(s => s.id === startupId);
    const feedback = interestsWithFeedback.filter(i => i.startupId === startupId);
    return { startup, feedback };
  }).filter(group => group.feedback.length > 0);

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
                    <h1 className="text-2xl font-semibold text-gray-900">Investor Feedback</h1>
                    <p className="mt-1 text-sm text-gray-600">Review the feedback you've received from investors</p>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {isLoadingStartups || isLoadingInterests ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : startups.length === 0 ? (
                  <Card className="bg-white p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Startups Created</h3>
                    <p className="text-gray-500 mt-2 mb-6">You haven't created any startups yet, so there's no feedback to display.</p>
                  </Card>
                ) : interestsWithFeedback.length === 0 ? (
                  <Card className="bg-white p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Feedback Yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">You haven't received any feedback from investors yet. Keep improving your pitch and sharing it!</p>
                  </Card>
                ) : (
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all">All Feedback</TabsTrigger>
                      <TabsTrigger value="highlights">Highlights</TabsTrigger>
                      <TabsTrigger value="by-startup">By Startup</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-6">
                      {interestsWithFeedback.map(interest => {
                        const startup = startups.find(s => s.id === interest.startupId);
                        return (
                          <Card key={interest.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant="outline" className="mb-2">{startup?.name}</Badge>
                                  <CardTitle className="text-base">Feedback from Investor #{interest.investorId}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {new Date(interest.createdAt).toLocaleDateString()}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="p-3 bg-blue-50 rounded-md">
                                <p className="text-gray-700 whitespace-pre-line">{interest.feedback}</p>
                              </div>
                              <div className="flex mt-4 text-sm text-gray-500">
                                <button className="flex items-center text-green-600 hover:text-green-800">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Helpful
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>
                    
                    <TabsContent value="highlights" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Feedback Highlights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {interestsWithFeedback.slice(0, 3).map((interest, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-md">
                                <div className="flex items-center mb-2">
                                  <Badge variant="outline" className="mr-2">{startups.find(s => s.id === interest.startupId)?.name}</Badge>
                                  <span className="text-sm text-gray-500">Investor #{interest.investorId}</span>
                                </div>
                                <p className="italic text-gray-700">{
                                  interest.feedback && interest.feedback.length > 120 
                                    ? `"${interest.feedback.substring(0, 120)}..."` 
                                    : `"${interest.feedback}"`
                                }</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Feedback Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-gray-50 rounded-md">
                              <div className="text-2xl font-bold text-primary mb-1">{interestsWithFeedback.length}</div>
                              <p className="text-gray-500">Total Feedback</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md">
                              <div className="text-2xl font-bold text-green-600 mb-1">{feedbackByStartup.length}</div>
                              <p className="text-gray-500">Startups with Feedback</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {Math.round(interestsWithFeedback.length / (startups.length || 1))}
                              </div>
                              <p className="text-gray-500">Avg. Feedback per Startup</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="by-startup" className="space-y-6">
                      {feedbackByStartup.map(group => (
                        <Card key={group.startup?.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex justify-between items-center">
                              <span>{group.startup?.name}</span>
                              <Badge className="ml-2">{group.feedback.length} feedback</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y">
                              {group.feedback.map(interest => (
                                <div key={interest.id} className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium">Investor #{interest.investorId}</h3>
                                      <p className="text-sm text-gray-500">
                                        {new Date(interest.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                                    <p className="text-gray-700 whitespace-pre-line">{interest.feedback}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}