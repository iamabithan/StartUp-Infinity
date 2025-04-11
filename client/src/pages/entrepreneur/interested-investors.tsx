import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import { Interest, Startup } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, MessageSquare, User } from "lucide-react";

export default function InterestedInvestors() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch user's startups
  const { data: startups = [], isLoading: isLoadingStartups } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user && user.role === "entrepreneur",
  });

  // Fetch all startup interests
  const { data: allInterests = [], isLoading: isLoadingInterests } = useQuery<Interest[]>({
    queryKey: startups.length > 0 ? ['/api/startups/interests'] : [],
    enabled: startups.length > 0,
  });

  // Filter interests relevant to user's startups
  const startupIds = startups.map(startup => startup.id);
  const relevantInterests = allInterests.filter(interest => startupIds.includes(interest.startupId));

  // Group interests by startup
  const interestsByStartup = startupIds.map(startupId => {
    const startup = startups.find(s => s.id === startupId);
    const interests = relevantInterests.filter(i => i.startupId === startupId);
    return { startup, interests };
  });

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
                    <h1 className="text-2xl font-semibold text-gray-900">Interested Investors</h1>
                    <p className="mt-1 text-sm text-gray-600">Investors who have expressed interest in your startups</p>
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
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Startups Created</h3>
                    <p className="text-gray-500 mt-2 mb-6">You haven't created any startups yet, so there are no investor interests to display.</p>
                  </Card>
                ) : relevantInterests.length === 0 ? (
                  <Card className="bg-white p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Investor Interest Yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">You don't have any investors interested in your startups yet. Keep improving your pitch and sharing it!</p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {interestsByStartup
                      .filter(group => group.interests.length > 0)
                      .map(group => (
                        <Card key={group.startup?.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex justify-between items-center">
                              <span>{group.startup?.name}</span>
                              <Badge className="ml-2">{group.interests.length} interested</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y">
                              {group.interests.map(interest => (
                                <div key={interest.id} className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium">Investor #{interest.investorId}</h3>
                                      <p className="text-sm text-gray-500">
                                        Interested since {new Date(interest.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Active
                                    </Badge>
                                  </div>
                                  
                                  {interest.notes && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                                      <p className="font-medium mb-1">Notes:</p>
                                      <p className="text-gray-600">{interest.notes}</p>
                                    </div>
                                  )}
                                  
                                  {interest.feedback && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                      <p className="font-medium mb-1 text-blue-700">Feedback:</p>
                                      <p className="text-blue-600">{interest.feedback}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2 mt-4">
                                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                                      <Mail className="h-4 w-4 mr-1" />
                                      Contact
                                    </button>
                                    <button className="flex items-center text-sm text-green-600 hover:text-green-800">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Send Message
                                    </button>
                                    <span className="flex items-center text-xs text-gray-500 ml-auto">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(interest.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}