import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import PitchList from "@/components/pitches/pitch-list";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

export default function MyPitches() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user || user.role !== "entrepreneur") {
    // Redirect non-entrepreneurs
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex">
        <EntrepreneurSidebar activePath={location} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">My Pitches</h1>
                  <Link href="/create-pitch">
                    <Button className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create New Pitch
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <PitchList />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
