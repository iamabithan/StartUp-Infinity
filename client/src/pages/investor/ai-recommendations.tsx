import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import InvestorSidebar from "@/components/dashboard/investor-sidebar";
import AIStartupRecommendations from "@/components/recommendations/ai-startup-recommendations";

export default function AIRecommendationsPage() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user || user.role !== "investor") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Investor Access Only</h2>
          <p className="mt-2 text-gray-600">This page is only accessible to investors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <InvestorSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">AI Recommendations</h1>
                    <p className="mt-1 text-sm text-gray-600">Discover startups that match your investment preferences</p>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <AIStartupRecommendations />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}