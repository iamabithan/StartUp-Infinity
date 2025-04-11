import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";

export default function LiveEvents() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set());

  // Fetch upcoming events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { upcoming: true }],
    enabled: !!user,
  });

  const handleRegisterForEvent = (eventId: number) => {
    // In a real app, this would make an API call to register
    setRegisteredEvents(prev => {
      const newSet = new Set(prev);
      newSet.add(eventId);
      return newSet;
    });
  };

  // Format date to display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time to display
  const formatEventTime = (dateString: string, durationMinutes: number) => {
    const date = new Date(dateString);
    const startTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const endDate = new Date(date.getTime() + durationMinutes * 60000);
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Pitch Events</h1>
          <p className="mt-2 text-lg text-gray-600">
            Join upcoming live pitch events to connect with {user?.role === "entrepreneur" ? "investors" : "entrepreneurs"}.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Upcoming Events</h3>
              <p className="text-gray-500 mt-2 mb-6">
                There are no scheduled pitch events at the moment. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden flex flex-col">
                <div className="bg-primary-600 h-2" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {new Date(event.eventDate) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{formatEventDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{formatEventTime(event.eventDate, event.duration)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Open to all {user?.role === "entrepreneur" ? "entrepreneurs" : "investors"}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Video className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Virtual event via {event.meetingLink?.includes("zoom") ? "Zoom" : "Video Conference"}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between items-center w-full">
                    {registeredEvents.has(event.id) ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Registered
                      </Badge>
                    ) : (
                      <Button onClick={() => handleRegisterForEvent(event.id)}>
                        Register
                      </Button>
                    )}
                    
                    {event.meetingLink && (
                      <Button variant="outline" asChild>
                        <a 
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <span>Join</span>
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-12 bg-primary-50 rounded-lg p-6 border border-primary-100">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Want to host your own pitch event?
              </h2>
              <p className="text-gray-600">
                {user?.role === "entrepreneur" 
                  ? "Present your startup idea to potential investors in a live format."
                  : "Host a pitch event to discover innovative startups in your area of interest."}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline">
                Request to Host Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
