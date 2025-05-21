import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FilterCard } from '../components/FilterCard';
import { JobsList } from '../components/JobsList';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getJobs, filterJobs, searchJobs } from '../services/job.service';
import { GetJobsResponse, JobResponse } from '../types/job.types';
import { PulseLoader } from 'react-spinners';
import { X } from "lucide-react";

interface Props {}

export const JobsPage = (_props: Props) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const [filterParams, setFilterParams] = useState<{
    budget?: number;
    deliveryTime?: number;
  }>({});

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', filterParams, searchQuery],
    queryFn: async () => {
      let response: GetJobsResponse;
      
      if (!filterParams.budget && !filterParams.deliveryTime) {
        response = searchQuery ? await searchJobs(searchQuery) : await getJobs();
      } else {
        response = searchQuery 
          ? await searchJobs(searchQuery)
          : await filterJobs({ 
              budget: filterParams.budget!,
              deliveryTime: filterParams.deliveryTime!
            });
      }

      if (searchQuery && isJobResponse(response)) {
        const filteredJobs = response.jobs.filter(job => {
          const matchesBudget = !filterParams.budget || job.budget <= filterParams.budget;
          const matchesDelivery = !filterParams.deliveryTime || job.deliveryTime <= filterParams.deliveryTime;
          return matchesBudget && matchesDelivery;
        });
        
        return {
          jobs: filteredJobs,
          total: filteredJobs.length
        };
      }

      return response;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['jobs', filterParams, searchQuery]
    });
  }, [filterParams, searchQuery, queryClient]);

  const handleFilter = (budget?: number, deliveryTime?: number) => {
    setFilterParams(budget || deliveryTime ? { budget, deliveryTime } : {});
  };

  const handleClearSearch = () => {
    setSearchParams(params => {
      params.delete('q');
      return params;
    });
  };

  const isJobResponse = (data: GetJobsResponse): data is JobResponse => {
    return 'jobs' in data;
  }

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <PulseLoader color="#222E50"/>
    </div>
  )

  return (
    <>
      <div className="max-w-6xl mx-auto py-6 px-8">
        <div className="grid grid-cols-12 gap-6">
          {jobsData && isJobResponse(jobsData) && (
            <div className="col-span-3">
              <FilterCard 
                onFilter={handleFilter}
              />
            </div>
          )}
          <div className={`${jobsData && isJobResponse(jobsData) ? 'col-span-9' : 'col-span-12'}`}>
            {searchQuery && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Search results for: "{searchQuery}"
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center px-6 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear search
                </button>
              </div>
            )}
            <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {jobsData && isJobResponse(jobsData) && (
                  <JobsList jobs={jobsData.jobs} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}