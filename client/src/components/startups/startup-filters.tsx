import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Filter, Search, X } from "lucide-react";

interface FilterValues {
  industry?: string;
  location?: string;
  fundingStage?: string;
  fundingNeeded?: string;
  searchQuery?: string;
}

interface StartupFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
}

export default function StartupFilters({ onFilterChange, className = "" }: StartupFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    industry: "",
    location: "",
    fundingStage: "",
    fundingNeeded: "",
    searchQuery: ""
  });

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      industry: "",
      location: "",
      fundingStage: "",
      fundingNeeded: "",
      searchQuery: ""
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card className={`bg-white p-4 rounded-lg shadow mb-6 ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              className="pl-10 pr-4 py-2 text-sm"
              placeholder="Search startups..."
              value={filters.searchQuery || ""}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <Label htmlFor="industry-filter" className="text-sm font-medium text-gray-700 mb-1">Industry</Label>
            <Select 
              value={filters.industry} 
              onValueChange={(value) => handleFilterChange("industry", value)}
            >
              <SelectTrigger id="industry-filter">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="HealthTech">HealthTech</SelectItem>
                <SelectItem value="FinTech">FinTech</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Sustainability">Sustainability</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <Label htmlFor="location-filter" className="text-sm font-medium text-gray-700 mb-1">Location</Label>
            <Select 
              value={filters.location} 
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Boston">Boston</SelectItem>
                <SelectItem value="Austin">Austin</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <Label htmlFor="funding-stage-filter" className="text-sm font-medium text-gray-700 mb-1">Funding Stage</Label>
            <Select 
              value={filters.fundingStage} 
              onValueChange={(value) => handleFilterChange("fundingStage", value)}
            >
              <SelectTrigger id="funding-stage-filter">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stages</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <Label htmlFor="funding-amount-filter" className="text-sm font-medium text-gray-700 mb-1">Funding Amount</Label>
            <Select 
              value={filters.fundingNeeded} 
              onValueChange={(value) => handleFilterChange("fundingNeeded", value)}
            >
              <SelectTrigger id="funding-amount-filter">
                <SelectValue placeholder="All Amounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Amounts</SelectItem>
                <SelectItem value="0-500k">₹0 - ₹500K</SelectItem>
                <SelectItem value="500k-1m">₹500K - ₹1M</SelectItem>
                <SelectItem value="1m-5m">₹1M - ₹5M</SelectItem>
                <SelectItem value="5m+">₹5M+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            
            <Button type="button" variant="outline" onClick={clearFilters} className="whitespace-nowrap">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
