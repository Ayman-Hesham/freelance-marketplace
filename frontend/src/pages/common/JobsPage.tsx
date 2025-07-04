import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FilterCard } from '../../components/common/FilterCard';
import { JobsList } from '../../components/common/JobsList';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getJobs, filterJobs, searchJobs } from '../../services/job.service';
import { GetJobsResponse, JobResponse } from '../../types/job.types';
import { PulseLoader } from 'react-spinners';
import { X } from "lucide-react";
import { useLocation } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { Pagination } from '../../components/common/Pagination';

interface Props {}

export const JobsPage = (_props: Props) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const page = searchParams.get('page') || '1';
  const location = useLocation();
  
  const [filterParams, setFilterParams] = useState<{
    budget?: number;
    deliveryTime?: number;
  }>({});

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', filterParams, searchQuery, page],
    queryFn: async () => {
      let response: GetJobsResponse;
      
      if (!filterParams.budget && !filterParams.deliveryTime) {
        response = searchQuery ? await searchJobs(searchQuery) : await getJobs(parseInt(page));
      } else {
        response = searchQuery 
          ? await searchJobs(searchQuery)
          : await filterJobs({ 
              budget: filterParams.budget!,
              deliveryTime: filterParams.deliveryTime!,
              page: parseInt(page)
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
          total: filteredJobs.length,
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredJobs.length / 10)
        };
      }

      return response;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['jobs', filterParams, searchQuery, page]
    });
  }, [filterParams, searchQuery, queryClient, page]);

  const handleFilter = (budget?: number, deliveryTime?: number) => {
    setFilterParams(budget || deliveryTime ? { budget, deliveryTime } : {});
  };

  const handleClearSearch = () => {
    setSearchParams(params => {
      params.delete('q');
      return params;
    });
  };

  useEffect(() => {
    if (location.state?.jobLoadError) {
      toast.error('Failed to load job details');
    }
  }, [location.state?.jobLoadError]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo(0, 0);
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
    <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
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
              {jobsData && isJobResponse(jobsData) && (
                <Pagination
                  currentPage={jobsData.currentPage}
                  totalPages={jobsData.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}