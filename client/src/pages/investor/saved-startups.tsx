import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InvestorSidebar from "@/components/dashboard/investor-sidebar";
import { Startup, Interest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  BookmarkIcon, ArrowRight, DollarSign, MapPin, 
  Users, BookmarkX, CalendarDays, Link2 
} from "lucide-react";
import { Link } from "wouter";

export default function SavedStartups() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [removingInterest, setRemovingInterest] = useState(false);
  
  // Fetch investor interests
  const { data: interests = [], isLoading: isLoadingInterests } = useQuery<Interest[]>({
    queryKey: user ? [`/api/investors/${user.id}/interests`] : [],
    enabled: !!user && user.role === "investor",
  });
  
  // Fetch all startups
  const { data: startups = [], isLoading: isLoadingStartups } = useQuery<Startup[]>({
    queryKey: ['/api/startups'],
    enabled: !!user && user.role === "investor",
  });
  
  // Filter startups based on saved/bookmarked status
  const savedStartupIds = interests.map(interest => interest.startupId);
  const savedStartups = startups.filter(startup => savedStartupIds.includes(startup.id));
  
  // Get interest ID for a startup
  const getInterestId = (startupId: number) => {
    const interest = interests.find(i => i.startupId === startupId);
    return interest?.id || null;
  };
  
  // Format funding amount
  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
  };
  
  // Handle removing a saved startup
  const handleRemoveBookmark = async (startupId: number) => {
    if (!user) return;
    
    const interestId = getInterestId(startupId);
    if (!interestId) return;
    
    setRemovingInterest(true);
    
    try {
      await apiRequest("DELETE", `/api/interests/${interestId}`);
      
      toast({
        title: "Startup Removed",
        description: "The startup has been removed from your saved list.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/investors/${user.id}/interests`] });
      
      setSelectedStartupId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove the startup from your saved list.",
        variant: "destructive"
      });
    } finally {
      setRemovingInterest(false);
    }
  };
  
  if (!user || user.role !== "investor") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Investor Access Only</h2>
          <p className="mt-2 text-gray-600">This page is only accessible to investors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <InvestorSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Saved Startups</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Track and manage startups you've saved for further evaluation
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Tabs defaultValue="grid">
                  <div className="flex justify-between items-center mb-6">
                    <TabsList>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-gray-500">
                      {savedStartups.length} {savedStartups.length === 1 ? 'startup' : 'startups'} saved
                    </div>
                  </div>
                  
                  <TabsContent value="grid">
                    {isLoadingInterests || isLoadingStartups ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : savedStartups.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <BookmarkIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Saved Startups</h3>
                        <p className="text-gray-500 mt-2 mb-6">You haven't saved any startups yet.</p>
                        <Link href="/browse-startups">
                          <Button>
                            Browse Startups
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedStartups.map((startup) => (
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
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-primary hover:text-primary/70"
                                      onClick={() => setSelectedStartupId(startup.id)}
                                    >
                                      <BookmarkX className="h-5 w-5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove saved startup?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove {startup.name} from your saved startups list. You can always add it back later.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleRemoveBookmark(startup.id)}
                                        disabled={removingInterest}
                                      >
                                        {removingInterest ? "Removing..." : "Remove"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{startup.tagline}</p>
                              
                              <div className="mt-4 flex flex-wrap gap-2">
                                {startup.tags && startup.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
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
                                <div>
                                  <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                                    <Users className="h-3 w-3 mr-1" />
                                    Team of {startup.teamMembers ? Object.keys(startup.teamMembers).length : 0}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <Link href={`/startup/${startup.id}`}>
                                  <Button className="w-full">
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="list">
                    {isLoadingInterests || isLoadingStartups ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : savedStartups.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <BookmarkIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Saved Startups</h3>
                        <p className="text-gray-500 mt-2 mb-6">You haven't saved any startups yet.</p>
                        <Link href="/browse-startups">
                          <Button>
                            Browse Startups
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {savedStartups.map((startup) => {
                            const interest = interests.find(i => i.startupId === startup.id);
                            const savedDate = interest ? new Date(interest.createdAt) : null;
                            
                            return (
                              <li key={startup.id}>
                                <div className="block hover:bg-gray-50">
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                      <div className="truncate">
                                        <div className="flex items-center">
                                          <p className="truncate text-sm font-medium text-primary">
                                            {startup.name}
                                          </p>
                                          <Badge 
                                            variant="secondary" 
                                            className="ml-2 bg-blue-100 text-blue-800"
                                          >
                                            {startup.fundingStage}
                                          </Badge>
                                          <Badge 
                                            variant="secondary" 
                                            className="ml-2 bg-green-100 text-green-800"
                                          >
                                            {startup.industry}
                                          </Badge>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-gray-600">
                                          {startup.tagline}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Link href={`/startup/${startup.id}`}>
                                          <Button variant="outline" size="sm">
                                            View
                                          </Button>
                                        </Link>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                                              onClick={() => setSelectedStartupId(startup.id)}
                                            >
                                              <BookmarkX className="h-4 w-4 mr-1" />
                                              Remove
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Remove saved startup?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will remove {startup.name} from your saved startups list. You can always add it back later.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => handleRemoveBookmark(startup.id)}
                                                disabled={removingInterest}
                                              >
                                                {removingInterest ? "Removing..." : "Remove"}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                      <div className="sm:flex">
                                        {startup.location && (
                                          <p className="flex items-center text-sm text-gray-500 mr-4">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {startup.location}
                                          </p>
                                        )}
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 mr-4">
                                          <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                          {formatFunding(startup.fundingNeeded)}
                                        </p>
                                        {startup.website && (
                                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <Link2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            <a 
                                              href={startup.website} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              Website
                                            </a>
                                          </p>
                                        )}
                                      </div>
                                      {savedDate && (
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                          <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                          <p>
                                            Saved on{' '}
                                            <time dateTime={savedDate.toISOString()}>
                                              {savedDate.toLocaleDateString()}
                                            </time>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}