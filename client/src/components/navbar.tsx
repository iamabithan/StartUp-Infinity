import { Fragment, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: user ? [`/api/users/${user.id}/notifications`] : [],
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-lg text-gray-900">LaunchMatch</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {!user ? (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" className="px-3 py-2 text-sm font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="px-3 py-2 rounded-md text-sm font-medium">
                      Register
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <div className="p-2 font-medium text-sm">Notifications</div>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                            <Link href={notification.link || "#"} className="w-full">
                              <div className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                                {notification.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{notification.message}</div>
                            </Link>
                          </DropdownMenuItem>
                        ))
                      )}
                      {notifications.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="p-2 text-center">
                            <Link href="/notifications" className="text-primary text-sm">
                              View all
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                          alt="User Profile"
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <span className="ml-1 text-sm font-medium text-gray-700">{user.fullName}</span>
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          Your Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {!user ? (
              <div className="px-4 py-2 flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-1">
                <div className="flex items-center px-3 py-2">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                    alt="User Profile"
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{user.fullName}</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    Your Profile
                  </Button>
                </Link>
                <div className="flex items-center">
                  <Link href="/notifications">
                    <Button variant="ghost" className="w-full justify-start">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
