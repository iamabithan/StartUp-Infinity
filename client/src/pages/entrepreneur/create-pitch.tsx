import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import EntrepreneurSidebar from "@/components/dashboard/entrepreneur-sidebar";
import CreatePitchForm from "@/components/pitches/create-pitch-form";

export default function CreatePitch() {
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Pitch</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <CreatePitchForm />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
