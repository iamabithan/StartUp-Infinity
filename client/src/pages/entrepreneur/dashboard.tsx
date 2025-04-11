import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import StatCard from "@/components/dashboard/stat-card";
import ActivityFeed, { ActivityItem } from "@/components/dashboard/activity-feed";
import AIInsights from "@/components/dashboard/ai-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Startup, Interest, Notification, AiFeedback } from "@shared/schema";
import { BookmarkIcon, MessageSquare, Video, BarChart } from "lucide-react";

export default function EntrepreneurDashboard() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch startups created by the entrepreneur
  const { data: startups = [] } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user,
  });

  // Fetch notifications for the user
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: user ? [`/api/users/${user.id}/notifications`] : [],
    enabled: !!user,
  });
  
  // Get all investor interests in the entrepreneur's startups
  const startupsIds = startups.map(startup => startup.id);
  
  // If there are no startups, don't make the query
  const fetchInterestsEnabled = startupsIds.length > 0 && !!user;
  
  // For each startup, fetch interests
  const { data: interestsData = [] } = useQuery<Record<number, Interest[]>>({
    queryKey: fetchInterestsEnabled ? ['/api/interests', startupsIds] : [],
    enabled: fetchInterestsEnabled,
    queryFn: async () => {
      const interests: Record<number, Interest[]> = {};
      
      for (const startupId of startupsIds) {
        const res = await fetch(`/api/startups/${startupId}/interests`);
        if (res.ok) {
          interests[startupId] = await res.json();
        } else {
          interests[startupId] = [];
        }
      }
      
      return interests;
    }
  });
  
  // Count total interests
  const interestsCount = Object.values(interestsData).reduce(
    (sum, interestsArray) => sum + interestsArray.length, 
    0
  );
  
  // Fetch AI feedback for the latest startup
  const latestStartup = startups[0];
  
  const { data: aiFeedback } = useQuery<AiFeedback>({
    queryKey: latestStartup ? [`/api/startups/${latestStartup.id}/ai-feedback`] : [],
    enabled: !!latestStartup,
  });

  // Convert notifications to activity feed format
  const activities: ActivityItem[] = notifications.map(notification => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'interest':
          return <BookmarkIcon className="h-5 w-5 text-primary-600" />;
        case 'ai-feedback':
          return <BarChart className="h-5 w-5 text-green-600" />;
        case 'event':
          return <Video className="h-5 w-5 text-yellow-600" />;
        default:
          return <MessageSquare className="h-5 w-5 text-blue-600" />;
      }
    };
    
    const getIconBgColor = (type: string) => {
      switch (type) {
        case 'interest':
          return 'bg-primary-100';
        case 'ai-feedback':
          return 'bg-green-100';
        case 'event':
          return 'bg-yellow-100';
        default:
          return 'bg-blue-100';
      }
    };
    
    // Calculate a human-readable timestamp
    const getRelativeTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(diff / 3600000);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    };
    
    return {
      id: notification.id,
      icon: getIcon(notification.type),
      iconBgColor: getIconBgColor(notification.type),
      title: notification.title,
      description: notification.message,
      linkText: "View details",
      linkHref: notification.link || '#',
      timestamp: getRelativeTime(new Date(notification.createdAt))
    };
  });

  if (!user || user.role !== "entrepreneur") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <EntrepreneurSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Entrepreneur Dashboard</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Dashboard content */}
                <div className="py-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                      title="Active Pitches"
                      value={startups.length}
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>}
                      linkText="View all"
                      linkHref="/my-pitches"
                    />
                    
                    <StatCard
                      title="Investor Interest"
                      value={interestsCount}
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>}
                      iconBgColor="bg-green-100"
                      iconColor="text-green-600"
                      linkText="View all"
                      linkHref="/interested-investors"
                    />
                    
                    <StatCard
                      title="New Feedback"
                      value={notifications.filter(n => n.type === 'interest' && n.read === false).length}
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>}
                      iconBgColor="bg-yellow-100"
                      iconColor="text-yellow-600"
                      linkText="View all"
                      linkHref="/feedback"
                    />
                    
                    <StatCard
                      title="Upcoming Pitches"
                      value={1}
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>}
                      iconBgColor="bg-purple-100"
                      iconColor="text-purple-600"
                      linkText="View all"
                      linkHref="/live-events"
                    />
                  </div>

                  {/* Recent Activity */}
                  <Card className="mb-8">
                    <CardHeader className="px-6 py-5 border-b border-gray-200">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ActivityFeed activities={activities} viewAllLink="/notifications" />
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  {aiFeedback && latestStartup && (
                    <Card>
                      <CardHeader className="px-6 py-5 border-b border-gray-200">
                        <CardTitle className="text-lg font-medium text-gray-900">
                          AI Insights for {latestStartup.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <AIInsights feedback={aiFeedback} startupId={latestStartup.id} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
