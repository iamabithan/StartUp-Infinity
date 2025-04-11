import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter both username and password.",
      });
      return;
    }
    
    // The login function is now provided by the auth context
    await login(username, password);
  };

  return (
    <Card className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-md">
      <div className="text-center">
        <div className="flex justify-center">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="rounded-md -space-y-px">
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
              autoComplete="username"
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
              autoComplete="current-password"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </Label>
          </div>

          <div className="text-sm">
            <Link href="#" className="font-medium text-primary hover:text-primary/80">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 ml-1">
            Register now
          </Link>
        </div>
      </form>
    </Card>
  );
}
