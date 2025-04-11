import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Users, MessageCircle, Eye } from "lucide-react";

type Pitch = {
  id: number;
  name: string;
  tagline: string;
  industry: string;
  fundingStage: string;
  fundingMin: number;
  fundingMax: number;
  status: string;
  createdAt: string;
  views?: number;
};

type FeedbackItem = {
  id: number;
  content: string;
  startupId: number;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    profilePicture?: string;
  }
};

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  type: string;
};

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user's startups
  const { 
    data: pitches = [], 
    isLoading: isPitchesLoading 
  } = useQuery<Pitch[]>({
    queryKey: ['/api/startups', { userId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/startups?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch pitches');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch feedback for user's startups
  const {
    data: allFeedback = [],
    isLoading: isFeedbackLoading
  } = useQuery<FeedbackItem[]>({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      if (!pitches.length) return [];
      
      const feedbackPromises = pitches.map(pitch => 
        fetch(`/api/feedback/startup/${pitch.id}`)
          .then(res => res.ok ? res.json() : [])
      );
      
      const feedbackArrays = await Promise.all(feedbackPromises);
      return feedbackArrays.flat();
    },
    enabled: !!pitches.length
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

  // Filter to get recent feedback
  const recentFeedback = [...allFeedback]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calculate stats
  const activePitchesCount = pitches.filter(p => p.status === 'active').length;
  const interestedInvestorsCount = 14; // Simulated count for now
  const feedbackReceivedCount = allFeedback.length;
  const upcomingEventsCount = upcomingEvents.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date from API
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrepreneur Dashboard</h1>
        <div className="mt-3 sm:mt-0">
          <Button asChild>
            <Link href="/create-pitch">Create New Pitch</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Pitches</CardTitle>
            </div>
            <div className="text-3xl font-bold">{activePitchesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investor Interest</CardTitle>
            </div>
            <div className="text-3xl font-bold">{interestedInvestorsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback Received</CardTitle>
            </div>
            <div className="text-3xl font-bold">{feedbackReceivedCount}</div>
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
        {/* Your Pitches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Pitches</CardTitle>
            </CardHeader>
            
            {isPitchesLoading ? (
              <CardContent>
                <div className="flex justify-center p-4">
                  <p>Loading your pitches...</p>
                </div>
              </CardContent>
            ) : pitches.length === 0 ? (
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-muted-foreground">You haven't created any pitches yet.</p>
                  <Button asChild>
                    <Link href="/create-pitch">Create Your First Pitch</Link>
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {pitches.map((pitch) => (
                    <li key={pitch.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary truncate">{pitch.name}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {pitch.status === 'active' ? 'Active' : pitch.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="mr-1.5 text-gray-400">•</span>
                              <span>{pitch.industry}</span>
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <span className="mr-1.5 text-gray-400">•</span>
                              <span>{formatCurrency(pitch.fundingMin)} - {formatCurrency(pitch.fundingMax)}</span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Eye className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{pitch.views || 0} views</span>
                          </div>
                        </div>
                        <div className="mt-2 flex">
                          <Link href={`/edit-pitch/${pitch.id}`}>
                            <a className="text-sm font-medium text-primary hover:text-primary-700">
                              Edit
                            </a>
                          </Link>
                          <span className="mx-2 text-gray-500">·</span>
                          <Link href={`/startup/${pitch.id}`}>
                            <a className="text-sm font-medium text-primary hover:text-primary-700">
                              View Details
                            </a>
                          </Link>
                          <span className="mx-2 text-gray-500">·</span>
                          <Link href={`/pitch/${pitch.id}/investors`}>
                            <a className="text-sm font-medium text-primary hover:text-primary-700">
                              Interested Investors (5)
                            </a>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {isFeedbackLoading ? (
                <div className="flex justify-center p-4">
                  <p>Loading feedback...</p>
                </div>
              ) : recentFeedback.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No feedback received yet.</p>
                </div>
              ) : (
                <>
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Avatar>
                            <AvatarImage src={feedback.user.profilePicture} alt={feedback.user.fullName} />
                            <AvatarFallback>{feedback.user.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{feedback.user.fullName}</p>
                          <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{feedback.content}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        On: {pitches.find(p => p.id === feedback.startupId)?.name || 'Unknown Startup'}
                      </p>
                    </div>
                  ))}
                  <Link href="/my-feedback">
                    <a className="block text-center text-sm font-medium text-primary hover:text-primary-700">
                      View all feedback
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
                              Register Now <span aria-hidden="true">→</span>
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/live-events">
                    <a className="block text-center text-sm font-medium text-primary hover:text-primary-700">
                      View all events
                    </a>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
