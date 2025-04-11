import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { insertStartupSchema } from "@shared/schema";

const createPitchSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(100, "Tagline must be less than 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  industry: z.string().min(1, "Please select an industry"),
  fundingNeeded: z.string().transform((val) => parseInt(val)),
  fundingStage: z.string().min(1, "Please select a funding stage"),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  pitchDeck: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  pitchVideo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tags: z.string().transform((val) => val.split(",").map(tag => tag.trim())),
  teamMembers: z.string().transform((val) => {
    try {
      const teamArray = val.split("\n").filter(Boolean).map(member => {
        const [name, role] = member.split("-").map(part => part.trim());
        return { name, role, bio: "" };
      });
      return teamArray;
    } catch (error) {
      return [];
    }
  })
});

type CreatePitchFormValues = z.infer<typeof createPitchSchema>;

export default function CreatePitchForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<CreatePitchFormValues>({
    resolver: zodResolver(createPitchSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      industry: "",
      fundingNeeded: "500000",
      fundingStage: "",
      location: "",
      website: "",
      pitchDeck: "",
      pitchVideo: "",
      tags: "",
      teamMembers: `${user?.fullName} - Founder\n`
    }
  });

  const onSubmit = async (data: CreatePitchFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a pitch.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Transform the data to match the expected schema
      const pitchData = {
        userId: user.id,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        industry: data.industry,
        fundingNeeded: data.fundingNeeded,
        fundingStage: data.fundingStage,
        location: data.location || null,
        website: data.website || null,
        pitchDeck: data.pitchDeck || null,
        pitchVideo: data.pitchVideo || null,
        tags: data.tags,
        teamMembers: data.teamMembers,
        logo: null,
        coverImage: null
      };

      await apiRequest("POST", "/api/startups", pitchData);
      
      toast({
        title: "Pitch Created Successfully",
        description: "Your startup pitch has been created and is now visible to investors."
      });
      
      setLocation("/my-pitches");
    } catch (error) {
      console.error("Error creating pitch:", error);
      toast({
        title: "Error Creating Pitch",
        description: "There was an error creating your pitch. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Pitch</CardTitle>
        <CardDescription>
          Share your startup idea with potential investors. Provide comprehensive details to increase your chances of getting funded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., EcoTrack" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your company or project name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Carbon footprint tracking for eco-conscious consumers" {...field} />
                    </FormControl>
                    <FormDescription>
                      A brief, catchy description (max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your startup, its mission, and value proposition in detail..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive description of your startup
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Sustainability">Sustainability</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fundingStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a funding stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series B">Series B</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fundingNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Needed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="100000">₹100K</SelectItem>
                        <SelectItem value="250000">₹250K</SelectItem>
                        <SelectItem value="500000">₹500K</SelectItem>
                        <SelectItem value="750000">₹750K</SelectItem>
                        <SelectItem value="1000000">₹1M</SelectItem>
                        <SelectItem value="2000000">₹2M</SelectItem>
                        <SelectItem value="5000000">₹5M</SelectItem>
                        <SelectItem value="10000000">₹10M+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where your company is based
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your company website (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AI, Mobile App, SaaS (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Keywords related to your startup
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pitchDeck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Deck URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Link to your pitch deck (Google Drive, Dropbox, etc.)" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to your presentation (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pitchVideo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="YouTube or Vimeo link" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to your video pitch (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List team members, one per line as: Name - Role" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter each team member on a new line as "Name - Role"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end gap-2 px-0">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setLocation("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Pitch"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
