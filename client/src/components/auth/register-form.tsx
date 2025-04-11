import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type UserRole = "entrepreneur" | "investor";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !username || !password || !selectedRole) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all fields and select a role.",
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        variant: "destructive",
        title: "Terms Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        fullName,
        email,
        username,
        password,
        role: selectedRole,
        bio: "",
        location: "",
        profileImage: "",
        interests: [],
        expertise: []
      };
      
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const user = await response.json();
      
      toast({
        title: "Registration Successful",
        description: `Welcome to LaunchMatch, ${user.fullName}!`,
      });
      
      login(user);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-md">
      <div className="text-center">
        <div className="flex justify-center">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join the LaunchMatch community today
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="rounded-md -space-y-px">
          <div className="mb-4">
            <Label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </Label>
            <Input
              id="fullname"
              name="fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Full name"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">I am a:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center",
                  selectedRole === "entrepreneur" && "bg-primary/5 border-primary"
                )}
                onClick={() => setSelectedRole("entrepreneur")}
              >
                <svg className="w-6 h-6 text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-medium">Entrepreneur</h3>
                <p className="text-xs text-gray-500 mt-1">I have ideas and seek funding</p>
              </div>
              <div 
                className={cn(
                  "bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center",
                  selectedRole === "investor" && "bg-primary/5 border-primary"
                )}
                onClick={() => setSelectedRole("investor")}
              >
                <svg className="w-6 h-6 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium">Investor</h3>
                <p className="text-xs text-gray-500 mt-1">I want to fund startups</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
            required
          />
          <Label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the <Link href="#" className="text-primary hover:text-primary/80">Terms of Service</Link> and <Link href="#" className="text-primary hover:text-primary/80">Privacy Policy</Link>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account?</span>
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 ml-1">
            Sign in
          </Link>
        </div>
      </form>
    </Card>
  );
}
