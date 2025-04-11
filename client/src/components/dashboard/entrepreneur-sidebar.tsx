import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activePath: string;
}

export default function EntrepreneurSidebar({ activePath }: SidebarProps) {
  const links = [
    { href: "/dashboard", label: "Overview", icon: "home" },
    { href: "/my-pitches", label: "My Pitches", icon: "bullhorn", badge: "3" },
    { href: "/create-pitch", label: "Create New Pitch", icon: "plus-circle" },
    { href: "/pitch-analyzer", label: "Pitch Analyzer", icon: "brain", badge: "AI", badgeColor: "bg-blue-100 text-blue-800" },
    { href: "/interested-investors", label: "Interested Investors", icon: "user-tie", badge: "5", badgeColor: "bg-primary-100 text-primary-800" },
    { href: "/live-events", label: "Live Pitch Events", icon: "video", badge: "New", badgeColor: "bg-yellow-100 text-yellow-800" },
    { href: "/feedback", label: "Feedback", icon: "comments" },
    { href: "/ai-matches", label: "AI Matches", icon: "robot" },
    { href: "/profile", label: "Profile", icon: "user" },
    { href: "/settings", label: "Settings", icon: "cog" },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      home: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>,
      bullhorn: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>,
      "plus-circle": <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
      brain: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>,
      "user-tie": <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>,
      video: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>,
      comments: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>,
      robot: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
             </svg>,
      user: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>,
      cog: <svg className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>,
    };
    
    return icons[iconName] || icons.home;
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 pt-16 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto custom-scrollbar">
        <div className="flex-1 px-2 space-y-1">
          <div className="px-3 mb-6">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entrepreneur Dashboard</span>
          </div>
          
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
            >
              <div
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                  activePath === link.href
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {getIcon(link.icon)}
                {link.label}
                {link.badge && (
                  <span className={cn("ml-auto text-xs py-0.5 px-1.5 rounded-full", link.badgeColor || "bg-gray-100 text-gray-600")}>
                    {link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
