import { Link, useLocation } from "wouter";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, userRole, onLogout }: MobileMenuProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="px-0 sm:hidden">
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarImage src={user?.profilePicture} alt={user?.fullName || ""} />
                <AvatarFallback>
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{user?.fullName || 'User'}</div>
              <div className="text-sm font-medium text-gray-500">{user?.email || 'user@example.com'}</div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-3 space-y-1 px-2">
            <Link href="/dashboard">
              <a 
                className={`${isActive("/dashboard") ? "bg-primary-50 border-primary text-primary" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={onClose}
              >
                Dashboard
              </a>
            </Link>
            
            {userRole === "investor" ? (
              <Link href="/browse-startups">
                <a 
                  className={`${isActive("/browse-startups") ? "bg-primary-50 border-primary text-primary" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={onClose}
                >
                  Browse Startups
                </a>
              </Link>
            ) : (
              <Link href="/my-pitches">
                <a 
                  className={`${isActive("/my-pitches") ? "bg-primary-50 border-primary text-primary" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={onClose}
                >
                  My Pitches
                </a>
              </Link>
            )}
            
            <Link href="/live-events">
              <a 
                className={`${isActive("/live-events") ? "bg-primary-50 border-primary text-primary" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={onClose}
              >
                Live Events
              </a>
            </Link>
            
            <Link href="/ai-matches">
              <a 
                className={`${isActive("/ai-matches") ? "bg-primary-50 border-primary text-primary" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={onClose}
              >
                AI Matches
              </a>
            </Link>
          </div>
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="mt-3 space-y-1 px-2">
            <Link href="/profile">
              <a 
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={onClose}
              >
                Your Profile
              </a>
            </Link>
            <a 
              href="#" 
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Settings
            </a>
            <a 
              href="#" 
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              onClick={onLogout}
            >
              Sign out
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
