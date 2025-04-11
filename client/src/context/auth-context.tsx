import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "entrepreneur" | "investor";
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: "entrepreneur" | "investor";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const { user: apiUser } = await response.json();
      console.log({apiUser});
      if (!apiUser?._id) {
        throw new Error("Invalid response from server - missing user ID");
      }

      // Generate a simple token for client-side use
      const token = btoa(JSON.stringify({
        id: apiUser._id,
        timestamp: Date.now()
      }));

      const newUser = {
        id: apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
        fullName: apiUser.fullName,
        role: apiUser.role,
        token: token
      };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      setLocation("/dashboard");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const { user: apiUser } = await response.json();
      
      if (!apiUser?._id) {
        throw new Error("Invalid response from server - missing user ID");
      }

      const token = btoa(JSON.stringify({
        id: apiUser._id,
        timestamp: Date.now()
      }));

      const newUser = {
        id: apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
        fullName: apiUser.fullName,
        role: apiUser.role,
        token: token
      };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      
      setLocation("/dashboard");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
