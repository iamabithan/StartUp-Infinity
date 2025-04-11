import { useState } from "react";
import { Link } from "wouter";
import { Startup } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Users, BookmarkIcon, MessageSquare, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface StartupCardProps {
  startup: Startup;
  isBookmarked?: boolean;
  onToggleBookmark?: (startupId: number, isBookmarked: boolean) => void;
}

export default function StartupCard({ startup, isBookmarked = false, onToggleBookmark }: StartupCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Format funding needed to user-friendly string (e.g., $500K)
  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
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
    
    setIsLoading(true);
    
    try {
      if (!bookmarked) {
        // Create a new interest
        await apiRequest("POST", "/api/interests", {
          investorId: user.id,
          startupId: startup.id,
          notes: `Bookmarked ${startup.name}`
        });
        
        toast({
          title: "Startup Saved",
          description: `${startup.name} has been added to your saved startups.`
        });
      } else {
        // For now, this would need to be implemented with a DELETE endpoint
        // that we would need to add to the backend
        toast({
          title: "Feature Not Available",
          description: "Removing bookmarks is not implemented yet."
        });
        return;
      }
      
      setBookmarked(!bookmarked);
      if (onToggleBookmark) {
        onToggleBookmark(startup.id, !bookmarked);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to update bookmark status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the team size
  const teamSize = startup.teamMembers ? Object.keys(startup.teamMembers).length : 0;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleBookmark}
            disabled={isLoading}
            className={`text-gray-400 hover:text-primary ${bookmarked ? 'text-primary' : ''}`}
          >
            <BookmarkIcon className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
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
              Team of {teamSize}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between">
            <Link href={`/startup/${startup.id}`}>
              <Button variant="outline" size="sm" className="text-sm">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="secondary" size="sm" className="text-sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
