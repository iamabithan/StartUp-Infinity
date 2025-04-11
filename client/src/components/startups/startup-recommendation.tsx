import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Startup } from "@shared/schema";
import { BookmarkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";

interface StartupRecommendationProps {
  startup: Startup;
  matchPercentage: number;
  onBookmark?: (startupId: number) => void;
}

export default function StartupRecommendation({ startup, matchPercentage, onBookmark }: StartupRecommendationProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save startups.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== "investor") {
      toast({
        title: "Action Not Available",
        description: "Only investors can bookmark startups.",
        variant: "destructive"
      });
      return;
    }
    
    setIsBookmarking(true);
    
    try {
      await apiRequest("POST", "/api/interests", {
        investorId: user.id,
        startupId: startup.id,
        notes: `AI Recommended: ${startup.name}`
      });
      
      toast({
        title: "Startup Saved",
        description: `${startup.name} has been added to your saved startups.`
      });
      
      if (onBookmark) {
        onBookmark(startup.id);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to save the startup.",
        variant: "destructive"
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 bg-gray-200 relative">
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
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="text-base font-medium text-gray-900">{startup.name}</h4>
          <Badge variant="outline" className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
            {matchPercentage}% Match
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{startup.tagline}</p>
        <div className="mt-3 flex items-center text-sm text-gray-500 space-x-3">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {startup.location || "Remote"}
          </span>
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${(startup.fundingNeeded / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="mt-4 flex space-x-2">
          <Link href={`/startup/${startup.id}`}>
            <Button variant="outline" size="sm" className="text-xs">
              View details
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs"
            onClick={handleBookmark}
            disabled={isBookmarking}
          >
            <BookmarkIcon className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
