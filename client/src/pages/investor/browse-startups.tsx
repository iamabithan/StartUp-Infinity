import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import InvestorSidebar from "@/components/dashboard/investor-sidebar";
import StartupFilters from "@/components/startups/startup-filters";
import StartupCard from "@/components/startups/startup-card";
import { Startup, Interest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BrowseStartups() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  
  // Fetch all startups
  const { data: startups = [], isLoading } = useQuery<Startup[]>({
    queryKey: ['/api/startups', filters],
    enabled: !!user,
  });
  
  // Fetch investor interests to show which startups are bookmarked
  const { data: interests = [] } = useQuery<Interest[]>({
    queryKey: user ? [`/api/investors/${user.id}/interests`] : [],
    enabled: !!user,
  });
  
  // Get the bookmarked startup IDs
  const bookmarkedStartupIds = interests.map(interest => interest.startupId);
  
  const totalPages = Math.ceil(startups.length / itemsPerPage);
  const paginatedStartups = startups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };
  
  const handleToggleBookmark = (startupId: number, isBookmarked: boolean) => {
    // In a real app, we'd update local state or invalidate the query
    console.log(`Toggled bookmark for ${startupId}: ${isBookmarked}`);
  };

  if (!user || user.role !== "investor") {
    return <div>Loading...</div>;
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
                    <h1 className="text-2xl font-semibold text-gray-900">Browse Startups</h1>
                    <p className="mt-1 text-sm text-gray-600">Discover innovative startups looking for investment</p>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Filters */}
                <StartupFilters onFilterChange={handleFilterChange} />
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : paginatedStartups.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No startups found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters to find more startups.</p>
                  </div>
                ) : (
                  <>
                    {/* Startup Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {paginatedStartups.map((startup) => (
                        <StartupCard 
                          key={startup.id} 
                          startup={startup} 
                          isBookmarked={bookmarkedStartupIds.includes(startup.id)}
                          onToggleBookmark={handleToggleBookmark}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 bg-white rounded-lg shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <Button
                            variant="outline"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                              <span className="font-medium">
                                {Math.min(page * itemsPerPage, startups.length)}
                              </span>{" "}
                              of <span className="font-medium">{startups.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <Button
                                variant="outline"
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                              >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" />
                              </Button>
                              
                              {Array.from({ length: totalPages }).map((_, i) => (
                                <Button
                                  key={i}
                                  variant={page === i + 1 ? "default" : "outline"}
                                  className="relative inline-flex items-center px-4 py-2"
                                  onClick={() => setPage(i + 1)}
                                >
                                  {i + 1}
                                </Button>
                              ))}
                              
                              <Button
                                variant="outline"
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                              >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
