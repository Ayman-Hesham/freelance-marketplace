import { ToastContainer, toast, Bounce } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import { getApplicationsByFreelancerId } from '../../services/application.service'
import { JobsList } from '../../components/common/JobsList'
import { useAuth } from '../../hooks/useAuth'
import { JobResponse } from '../../types/job.types'
import { ApplicationsByFreelancerIdResponse } from '../../types/application.types'
import { useLocation, useSearchParams } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const FreelancerApplications = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page') || '1'
  const applicationSuccess = location.state?.applicationSuccess

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['applications', 'freelancer', user!.id, page],
    queryFn: () => getApplicationsByFreelancerId(user!.id, parseInt(page)),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (applicationSuccess) {
        toast.success('Application submitted successfully!')
        window.history.replaceState({}, document.title)
    }
  }, [applicationSuccess])

  useEffect(() => {
    if (location.state?.jobLoadError) {
      toast.error('Unable to load application');
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.jobLoadError]);

  const isJobResponse = (data: ApplicationsByFreelancerIdResponse): data is JobResponse => {
    return 'jobs' in data;
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo(0, 0)
  }

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <PulseLoader color="#222E50"/>
    </div>
  );

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

      <div className="mt-6 p-4 flex justify-center">
        <div className="rounded-lg p-8 w-full max-w-4xl border border-gray-300">
          <div className="flex justify-between items-center mb-6 px-2">
            <h1 className="text-2xl font-bold text-primary-500">My Applications</h1>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {jobsData && isJobResponse(jobsData) && (
              <>
                <JobsList jobs={jobsData.jobs} />
                
                {jobsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(jobsData.currentPage - 1)}
                      disabled={jobsData.currentPage === 1}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: jobsData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            jobsData.currentPage === pageNum
                              ? 'bg-secondary-500 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(jobsData.currentPage + 1)}
                      disabled={jobsData.currentPage === jobsData.totalPages}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default FreelancerApplications