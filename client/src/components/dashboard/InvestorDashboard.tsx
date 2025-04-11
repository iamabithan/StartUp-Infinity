import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Users, MessageCircle, Eye, BookmarkIcon, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Startup = {
  id: number;
  name: string;
  tagline: string;
  industry: string;
  fundingStage: string;
  fundingMin: number;
  fundingMax: number;
  description: string;
  status: string;
  createdAt: string;
  teamMembers: Array<{
    name: string;
    role: string;
    linkedinUrl?: string;
  }>;
  matchScore?: number;
};

type PortfolioItem = {
  id: number;
  name: string;
  tagline: string;
  industry: string;
  fundingStage: string;
  bookmarkDate: string;
};

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  type: string;
};

export default function InvestorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch AI recommended startups
  const { 
    data: recommendedStartups = [], 
    isLoading: isRecommendationsLoading 
  } = useQuery<Startup[]>({
    queryKey: ['/api/ai/matches', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/ai/matches/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch user's portfolio (bookmarked startups)
  const {
    data: portfolio = [],
    isLoading: isPortfolioLoading
  } = useQuery<Startup[]>({
    queryKey: ['/api/interests/user', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/interests/user/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch upcoming events
  const {
    data: events = [],
    isLoading: isEventsLoading
  } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch(`/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Filter to get only upcoming events
  const upcomingEvents = events.filter(event => {
    return new Date(event.date) > new Date();
  }).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Calculate stats
  const startupsViewedCount = 27; // Simulated for now
  const bookmarkedCount = portfolio.length;
  const feedbackSentCount = 12; // Simulated for now
  const upcomingEventsCount = upcomingEvents.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
        <div className="mt-3 sm:mt-0">
          <Button asChild>
            <Link href="/browse-startups">Browse All Startups</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Startups Viewed</CardTitle>
            </div>
            <div className="text-3xl font-bold">{startupsViewedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bookmarked</CardTitle>
            </div>
            <div className="text-3xl font-bold">{bookmarkedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback Sent</CardTitle>
            </div>
            <div className="text-3xl font-bold">{feedbackSentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
            </div>
            <div className="text-3xl font-bold">{upcomingEventsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* AI Recommended Startups */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>AI Recommended Startups</CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center">
                <Bot className="h-3 w-3 mr-1" /> AI-Powered
              </Badge>
            </CardHeader>
            
            <CardContent>
              {isRecommendationsLoading ? (
                <div className="flex justify-center p-4">
                  <p>Finding matches for you...</p>
                </div>
              ) : recommendedStartups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recommendations yet. Browse startups to get personalized matches.</p>
                  <Button asChild>
                    <Link href="/browse-startups">Browse Startups</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {recommendedStartups.slice(0, 4).map((startup) => (
                      <Card key={startup.id} className="hover:-translate-y-1 transition-transform duration-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{startup.name}</h4>
                              <p className="text-sm text-gray-500">{startup.tagline}</p>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {startup.fundingStage}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 line-clamp-3">{startup.description}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">•</span>
                              <span className="text-xs text-gray-500">{startup.industry}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500">
                                {formatCurrency(startup.fundingMin)} - {formatCurrency(startup.fundingMax)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex">
                              {startup.teamMembers && startup.teamMembers.slice(0, 3).map((member, idx) => (
                                <Avatar key={idx} className="h-6 w-6 border-2 border-white -ml-2 first:ml-0">
                                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {startup.teamMembers && startup.teamMembers.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 -ml-2">
                                  +{startup.teamMembers.length - 3}
                                </div>
                              )}
                              <span className="ml-2 text-xs text-gray-500">
                                Team of {startup.teamMembers?.length || 0}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getMatchScoreColor(startup.matchScore || 0)}
                            >
                              <Bot className="h-3 w-3 mr-1" /> {startup.matchScore || 0}% Match
                            </Badge>
                          </div>
                          <div className="mt-4 flex justify-between">
                            <Button variant="link" asChild className="px-0">
                              <Link href={`/startup/${startup.id}`}>
                                View Details
                              </Link>
                            </Button>
                            <button className="text-gray-400 hover:text-primary">
                              <BookmarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    <Button variant="link" asChild>
                      <Link href="/ai-matches">
                        View all recommendations <span aria-hidden="true">→</span>
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Your Portfolio */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {isPortfolioLoading ? (
                <div className="flex justify-center p-4">
                  <p>Loading portfolio...</p>
                </div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No startups in your portfolio yet.</p>
                </div>
              ) : (
                <>
                  {portfolio.map((startup) => (
                    <div key={startup.id} className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{startup.name}</h4>
                          <p className="text-xs text-gray-500">{startup.tagline}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {startup.fundingStage}
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{startup.industry}</span>
                        <span>Bookmarked {formatDate(startup.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  <Link href="/my-portfolio">
                    <a className="block text-center text-sm font-medium text-primary hover:text-primary-700">
                      View full portfolio
                    </a>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isEventsLoading ? (
                <div className="flex justify-center p-4">
                  <p>Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No upcoming events.</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">{upcomingEvents[0].title}</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>{upcomingEvents[0].description}</p>
                          <p className="mt-1"><strong>Date:</strong> {formatDate(upcomingEvents[0].date)}</p>
                          <p><strong>Duration:</strong> {upcomingEvents[0].duration} minutes</p>
                        </div>
                        <div className="mt-4">
                          <Link href={`/events/${upcomingEvents[0].id}`}>
                            <a className="text-sm font-medium text-blue-800 hover:text-blue-600">
                              Confirm Attendance <span aria-hidden="true">→</span>
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {upcomingEvents.length > 1 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Users className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-indigo-800">{upcomingEvents[1].title}</h3>
                          <div className="mt-2 text-sm text-indigo-700">
                            <p>{upcomingEvents[1].description}</p>
                            <p className="mt-1"><strong>Date:</strong> {formatDate(upcomingEvents[1].date)}</p>
                            <p><strong>Duration:</strong> {upcomingEvents[1].duration} minutes</p>
                          </div>
                          <div className="mt-4">
                            <Link href={`/events/${upcomingEvents[1].id}`}>
                              <a className="text-sm font-medium text-indigo-800 hover:text-indigo-600">
                                RSVP Now <span aria-hidden="true">→</span>
                              </a>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
