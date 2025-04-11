import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  linkText?: string;
  linkHref?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600",
  linkText,
  linkHref
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {linkText && linkHref && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href={linkHref} className="font-medium text-primary hover:text-primary/90">
              {linkText}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
