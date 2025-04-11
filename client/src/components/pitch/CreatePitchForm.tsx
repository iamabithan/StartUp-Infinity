import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FilePenLine, UploadCloud, PlusCircle, Wand2 } from "lucide-react";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const formSchema = z.object({
  name: z.string().min(1, "Startup name is required"),
  tagline: z.string().max(50, "Tagline cannot exceed 50 characters").min(1, "Tagline is required"),
  industry: z.string().min(1, "Industry is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
  fundingMin: z.coerce.number().min(1, "Minimum funding amount is required"),
  fundingMax: z.coerce.number().min(1, "Maximum funding amount is required"),
  description: z.string().min(1, "Description is required"),
  problem: z.string().min(1, "Problem statement is required"),
  solution: z.string().min(1, "Solution is required"),
  pitchDeck: z.string().optional(),
  videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  teamMembers: z.array(teamMemberSchema).optional(),
});

const defaultValues = {
  teamMembers: [{ name: "", role: "", linkedinUrl: "" }],
};

export default function CreatePitchForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleGenerateSwot = async () => {
    // This would be implemented if we had a startup to generate SWOT for
    toast({
      title: "AI Feature",
      description: "SWOT generation will be available after creating your pitch",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a pitch",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the user ID to the startup data
      const startupData = {
        ...values,
        userId: user.id,
      };

      const response = await apiRequest("POST", "/api/startups", startupData);
      const data = await response.json();

      toast({
        title: "Success!",
        description: "Your startup pitch has been created",
      });

      // Redirect to the pitch details page
      setLocation(`/startup/${data.startup.id}`);
    } catch (error) {
      console.error("Error creating pitch:", error);
      toast({
        title: "Failed to create pitch",
        description: "There was an error creating your pitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = () => {
    const teamMembers = form.getValues("teamMembers") || [];
    form.setValue("teamMembers", [...teamMembers, { name: "", role: "", linkedinUrl: "" }]);
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-2xl font-bold leading-6 text-gray-900">Create Your Startup Pitch</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Provide detailed information about your startup to attract the right investors.
        </p>
      </div>

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-4">
                        <FormLabel>Startup Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Tagline <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="A short, catchy description of your startup (50 chars max)" 
                            maxLength={50}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AI-ML">AI & Machine Learning</SelectItem>
                            <SelectItem value="FinTech">FinTech</SelectItem>
                            <SelectItem value="HealthTech">HealthTech</SelectItem>
                            <SelectItem value="EdTech">EdTech</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="CleanTech">CleanTech</SelectItem>
                            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                            <SelectItem value="Logistics">Logistics</SelectItem>
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
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Funding Stage <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series-a">Series A</SelectItem>
                            <SelectItem value="series-b">Series B</SelectItem>
                            <SelectItem value="series-c">Series C+</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundingMin"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Funding Min (USD) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <Input 
                              {...field} 
                              className="pl-7 pr-12" 
                              placeholder="0" 
                              type="number"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">USD</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundingMax"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Funding Max (USD) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <Input 
                              {...field} 
                              className="pl-7 pr-12" 
                              placeholder="0" 
                              type="number"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">USD</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Pitch Description <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={5}
                            placeholder="Describe your startup, its value proposition, target market, and why investors should be interested."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="problem"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Problem Statement <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="What problem are you solving? Why is it important?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solution"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Solution <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="How does your product/service solve the problem?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pitchDeck"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Pitch Deck <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <FilePenLine className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="pitch-deck" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                  <span>Upload a file</span>
                                  <Input 
                                    id="pitch-deck" 
                                    type="file" 
                                    accept=".pdf" 
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // In a real app, this would upload the file to a server
                                        // Here we just store the filename
                                        field.onChange(file.name);
                                      }
                                    }}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF up to 10MB
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Video Pitch URL (YouTube or Vimeo)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="sm:col-span-6">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Members
                    </Label>
                    <div className="border border-gray-300 rounded-md p-4">
                      <div className="space-y-4" id="team-members-container">
                        {form.watch("teamMembers")?.map((_, index) => (
                          <div key={index} className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6 border-b border-gray-200 pb-4">
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="text-xs">Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.role`}
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="text-xs">Role/Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.linkedinUrl`}
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="text-xs">LinkedIn URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={addTeamMember}
                          className="text-primary bg-primary-50 hover:bg-primary-100"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Team Member
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100"
                      onClick={handleGenerateSwot}
                      disabled={isGeneratingSwot}
                    >
                      <Wand2 className="mr-2 h-4 w-4" /> 
                      {isGeneratingSwot ? "Generating..." : "Generate SWOT Analysis with AI"}
                    </Button>
                    <p className="mt-1 text-xs text-gray-500">Our AI will analyze your pitch and provide a SWOT analysis.</p>
                  </div>
                </div>
              </CardContent>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-3"
                  onClick={() => {
                    // Save as draft functionality could be added here
                    toast({
                      title: "Draft saved",
                      description: "Your pitch has been saved as a draft",
                    });
                  }}
                >
                  Save & Preview
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Pitch"}
                </Button>
              </div>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
