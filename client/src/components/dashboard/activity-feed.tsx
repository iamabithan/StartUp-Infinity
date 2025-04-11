import { Link } from "wouter";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  viewAllLink?: string;
}

export default function ActivityFeed({ activities, viewAllLink }: ActivityFeedProps) {
  return (
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <li className="p-4 text-center text-gray-500">No recent activity</li>
        ) : (
          activities.map((activity) => (
            <li key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", activity.iconBgColor || "bg-primary-100")}>
                    {activity.icon}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                  {activity.linkText && activity.linkHref && (
                    <div className="mt-2 text-sm">
                      <Link href={activity.linkHref} className="font-medium text-primary hover:text-primary/90">
                        {activity.linkText}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                  {activity.timestamp}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      {viewAllLink && activities.length > 0 && (
        <div className="bg-gray-50 px-5 py-3 text-sm text-center">
          <Link href={viewAllLink} className="font-medium text-primary hover:text-primary/90">
            View all activity
          </Link>
        </div>
      )}
    </div>
  );
}
