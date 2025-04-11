import { useState } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { BookmarkIcon, Eye, Bot } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  linkedinUrl?: string;
}

interface PitchCardProps {
  id: number;
  name: string;
  tagline: string;
  industry: string;
  fundingStage: string;
  fundingMin: number;
  fundingMax: number;
  description: string;
  teamMembers?: TeamMember[];
  matchScore?: number;
  isBookmarked?: boolean;
  views?: number;
  onBookmarkToggle?: (startupId: number, bookmarked: boolean) => void;
}

export default function PitchCard({
  id,
  name,
  tagline,
  industry,
  fundingStage,
  fundingMin,
  fundingMax,
  description,
  teamMembers = [],
  matchScore,
  isBookmarked = false,
  views = 0,
  onBookmarkToggle,
}: PitchCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get funding stage badge color
  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case "pre-seed":
        return "bg-purple-100 text-purple-800";
      case "seed":
        return "bg-green-100 text-green-800";
      case "series-a":
        return "bg-blue-100 text-blue-800";
      case "series-b":
      case "series-c":
        return "bg-indigo-100 text-indigo-800";
      case "growth":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark startups",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "investor") {
      toast({
        title: "Feature unavailable",
        description: "Only investors can bookmark startups",
        variant: "destructive",
      });
      return;
    }

    setIsBookmarking(true);

    try {
      if (bookmarked) {
        // Remove bookmark
        await apiRequest("DELETE", "/api/interests", {
          userId: user.id,
          startupId: id,
        });
        setBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: `${name} has been removed from your portfolio`,
        });
      } else {
        // Add bookmark
        await apiRequest("POST", "/api/interests", {
          userId: user.id,
          startupId: id,
        });
        setBookmarked(true);
        toast({
          title: "Bookmarked",
          description: `${name} has been added to your portfolio`,
        });
      }

      // Call parent component callback if provided
      if (onBookmarkToggle) {
        onBookmarkToggle(id, !bookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "There was an error updating your bookmarks",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Card className="hover:-translate-y-1 transition-transform duration-200 h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">{tagline}</p>
          </div>
          <Badge
            variant="outline"
            className={getStageBadgeColor(fundingStage)}
          >
            {fundingStage
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">•</span>
            <span className="text-xs text-gray-500">{industry}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              {formatCurrency(fundingMin)} - {formatCurrency(fundingMax)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
          <div className="flex items-center">
            {teamMembers.length > 0 ? (
              <>
                <div className="flex -space-x-1 overflow-hidden">
                  {teamMembers.slice(0, 3).map((member, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {teamMembers.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                      +{teamMembers.length - 3}
                    </div>
                  )}
                </div>
                <span className="ml-2 text-xs text-gray-500">
                  Team of {teamMembers.length}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-500">No team members</span>
            )}
          </div>
          
          {matchScore !== undefined && (
            <Badge
              variant="outline"
              className={getMatchScoreColor(matchScore)}
            >
              <Bot className="h-3 w-3 mr-1" /> {matchScore}% Match
            </Badge>
          )}
          
          {views !== undefined && (
            <div className="flex items-center text-xs text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              {views} views
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button variant="link" asChild className="px-0">
            <Link href={`/startup/${id}`}>View Details</Link>
          </Button>
          <button
            className={`${
              bookmarked ? "text-primary" : "text-gray-400 hover:text-primary"
            } focus:outline-none disabled:opacity-50`}
            onClick={handleBookmarkToggle}
            disabled={isBookmarking}
          >
            <BookmarkIcon
              className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
