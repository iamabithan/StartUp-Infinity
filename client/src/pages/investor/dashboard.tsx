import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import InvestorSidebar from "@/components/dashboard/investor-sidebar";
import StatCard from "@/components/dashboard/stat-card";
import ActivityFeed, { ActivityItem } from "@/components/dashboard/activity-feed";
import StartupRecommendation from "@/components/startups/startup-recommendation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notification, Startup, Interest } from "@shared/schema";
import { Search, Briefcase, BookmarkIcon, Video, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function InvestorDashboard() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch notifications for the user
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: user ? [`/api/users/${user.id}/notifications`] : [],
    enabled: !!user,
  });

  // Fetch investor interests
  const { data: interests = [] } = useQuery<Interest[]>({
    queryKey: user ? [`/api/investors/${user.id}/interests`] : [],
    enabled: !!user,
  });

  // Fetch all startups for recommendations
  const { data: allStartups = [] } = useQuery<Startup[]>({
    queryKey: ['/api/startups'],
    enabled: !!user,
  });

  // Create AI-recommended startups with match percentages
  // For this mock, we're just assigning random match percentages
  const recommendedStartups = allStartups
    .filter(startup => !interests.some(interest => interest.startupId === startup.id))
    .slice(0, 3)
    .map(startup => ({
      startup,
      matchPercentage: Math.floor(Math.random() * 16) + 80 // 80-95%
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Convert notifications to activity feed format
  const activities: ActivityItem[] = notifications.map(notification => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'recommendation':
          return <Bot className="h-5 w-5 text-primary-600" />;
        case 'interest':
          return <BookmarkIcon className="h-5 w-5 text-green-600" />;
        case 'event':
          return <Video className="h-5 w-5 text-yellow-600" />;
        default:
          return <Search className="h-5 w-5 text-blue-600" />;
      }
    };
    
    const getIconBgColor = (type: string) => {
      switch (type) {
        case 'recommendation':
          return 'bg-primary-100';
        case 'interest':
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

  if (!user || user.role !== "investor") {
    return <div>Loading...</div>;
  }

  const handleRecommendationBookmark = (startupId: number) => {
    // This would be handled by the onBookmark prop
    console.log(`Bookmarked startup: ${startupId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <InvestorSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Investor Dashboard</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Dashboard content */}
                <div className="py-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                      title="New Startups"
                      value={allStartups.length}
                      icon={<Search className="h-5 w-5" />}
                      linkText="Browse all"
                      linkHref="/browse-startups"
                    />
                    
                    <StatCard
                      title="Portfolio Size"
                      value={interests.length}
                      icon={<Briefcase className="h-5 w-5" />}
                      iconBgColor="bg-green-100"
                      iconColor="text-green-600"
                      linkText="View portfolio"
                      linkHref="/portfolio"
                    />
                    
                    <StatCard
                      title="Saved Startups"
                      value={interests.filter(i => i.notes?.includes("Bookmarked")).length}
                      icon={<BookmarkIcon className="h-5 w-5" />}
                      iconBgColor="bg-yellow-100"
                      iconColor="text-yellow-600"
                      linkText="View saved"
                      linkHref="/bookmarks"
                    />
                    
                    <StatCard
                      title="Upcoming Events"
                      value={3}
                      icon={<Video className="h-5 w-5" />}
                      iconBgColor="bg-purple-100"
                      iconColor="text-purple-600"
                      linkText="View events"
                      linkHref="/live-events"
                    />
                  </div>

                  {/* AI Recommendations */}
                  <Card className="mb-8">
                    <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        AI Recommended Startups
                      </CardTitle>
                      <Link href="/ai-recommendations">
                        <Button variant="link" className="text-sm font-medium">
                          View all
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3 mb-6">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Based on your investment history and interests, Gemini AI has found these startups that match your profile.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendedStartups.map(({ startup, matchPercentage }) => (
                          <StartupRecommendation 
                            key={startup.id}
                            startup={startup}
                            matchPercentage={matchPercentage}
                            onBookmark={handleRecommendationBookmark}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="px-6 py-5 border-b border-gray-200">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ActivityFeed activities={activities} viewAllLink="/notifications" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
