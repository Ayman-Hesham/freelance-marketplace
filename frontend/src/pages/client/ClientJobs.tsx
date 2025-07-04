import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getJobsByClientId, deleteJob } from '../../services/job.service'
import { toast, ToastContainer } from 'react-toastify'
import { Bounce } from 'react-toastify'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { CreateJobModal } from '../../components/modals/CreateJobModal'
import { JobsList } from '../../components/common/JobsList'
import { useAuth } from '../../hooks/useAuth'
import { GetJobsResponse, JobResponse } from '../../types/job.types'
import { PulseLoader } from 'react-spinners'
import { DeleteJobDialog } from '../../components/dialogs/DeleteJobDialog'
import { useLocation, useSearchParams } from 'react-router-dom'

export const ClientJobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page') || '1'
  const jobDeleted = location.state?.jobDeleted
  const ApplicationAccepted = location.state?.ApplicationAccepted

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['clientJobs', user!.id, page],
    queryFn: () => getJobsByClientId(user!.id, parseInt(page)),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const handleCloseModal = (wasCreated = false) => {
    setIsModalOpen(false)
    if (wasCreated) {
      queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id], exact: false })
      queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false })
      setTimeout(() => {
        toast.success('Job created successfully')
      }, 100)
    }
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      await deleteJob(jobToDelete)
      queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id], exact: false })
      queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false })
      toast.success('Job deleted successfully')
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setJobToDelete(null)
    }
  }

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId)
  }

  const isJobResponse = (data: GetJobsResponse): data is JobResponse => {
    return 'jobs' in data;
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString())
      return prev
    })
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (ApplicationAccepted) {
        toast.success('Application accepted successfully!')
        window.history.replaceState({}, document.title)
    } else if (ApplicationAccepted === false) {
        toast.error('Error accepting application!')
        window.history.replaceState({}, document.title)
    }
    if (jobDeleted) {
        toast.success('Job deleted successfully!')
        window.history.replaceState({}, document.title)
    }
  }, [ApplicationAccepted, jobDeleted])

  useEffect(() => {
    if (location.state?.jobLoadError) {
      toast.error('Unable to load job details');
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.jobLoadError]);

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
            <h1 className="text-2xl font-bold text-primary-500">My Job Postings</h1>
            <button 
              className="flex items-center text-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Create Job
            </button>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {jobsData && isJobResponse(jobsData) && (
              <>
                <JobsList 
                  jobs={jobsData.jobs} 
                  clientId={user!.id} 
                  onDeleteJob={handleDeleteClick}
                />
                
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

      {isModalOpen && <CreateJobModal onClose={handleCloseModal} />}
      
      {jobToDelete && (
        <DeleteJobDialog
          isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          onConfirm={handleDeleteJob}
        />
      )}
    </>
  )
}

export default ClientJobs