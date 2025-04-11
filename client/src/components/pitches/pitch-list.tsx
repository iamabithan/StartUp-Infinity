import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Startup } from "@shared/schema";
import { useAuth } from "@/context/auth-context";

export default function PitchList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { data: pitches = [], isLoading, error } = useQuery<Startup[]>({
    queryKey: user ? [`/api/users/${user.id}/startups`] : [],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error Loading Pitches</h3>
        <p className="text-red-600">Failed to load your pitches. Please try again later.</p>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardContent className="pt-6">
          <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No Pitches Yet</h3>
          <p className="text-gray-600 mt-2 mb-4">You haven't created any startup pitches yet.</p>
          <Link href="/create-pitch">
            <Button>Create Your First Pitch</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleDeletePitch = async (pitchId: number) => {
    if (!confirm("Are you sure you want to delete this pitch? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(pitchId);
    
    try {
      await apiRequest("DELETE", `/api/startups/${pitchId}`);
      
      // Invalidate the cache to refresh the list
      queryClient.invalidateQueries({queryKey: [`/api/users/${user?.id}/startups`]});
      
      toast({
        title: "Pitch Deleted",
        description: "Your pitch has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the pitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {pitches.map((pitch) => (
        <Card key={pitch.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 bg-gray-100">
              <div className="h-full flex items-center justify-center p-6">
                {pitch.logo ? (
                  <img src={pitch.logo} alt={pitch.name} className="max-h-20" />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary text-xl font-bold">{pitch.name.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-3/4 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pitch.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{pitch.tagline}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {pitch.fundingStage}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {pitch.industry}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 py-4">
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{pitch.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {pitch.tags && pitch.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{pitch.teamMembers ? Object.keys(pitch.teamMembers).length : 0} team members</span>
                  <span className="mx-2">•</span>
                  <span>${(pitch.fundingNeeded / 1000).toFixed(0)}K funding needed</span>
                  {pitch.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{pitch.location}</span>
                    </>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-0 pt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created on {new Date(pitch.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Link href={`/startup/${pitch.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/edit-pitch/${pitch.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletePitch(pitch.id)} 
                    disabled={isDeleting === pitch.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isDeleting === pitch.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
