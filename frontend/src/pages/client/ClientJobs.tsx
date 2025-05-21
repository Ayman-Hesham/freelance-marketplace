import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getJobsByClientId, deleteJob } from '../../services/job.service'
import { toast, ToastContainer } from 'react-toastify'
import { Bounce } from 'react-toastify'
import { Plus } from 'lucide-react'
import { CreateJobModal } from '../../components/CreateJobModal'
import { JobsList } from '../../components/JobsList'
import { useAuth } from '../../context/AuthContext'
import { GetJobsResponse, JobResponse } from '../../types/job.types'
import { PulseLoader } from 'react-spinners'
import { DeleteJobDialog } from '../../components/DeleteJobDialog'

export const ClientJobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['clientJobs', user!.id],
    queryFn: () => getJobsByClientId(user!.id),
    staleTime: 0,
    gcTime: 0,
  })

  const handleCloseModal = useCallback((wasCreated = false) => {
    setIsModalOpen(false)
    if (wasCreated) {
      queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setTimeout(() => {
        toast.success('Job created successfully')
      }, 100)
    }
  }, [])

  const handleDeleteJob = useCallback(async () => {
    if (!jobToDelete) return

    try {
      await deleteJob(jobToDelete)
      queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted successfully')
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setJobToDelete(null)
    }
  }, [jobToDelete, queryClient])

  const handleDeleteClick = useCallback((jobId: string) => {
    setJobToDelete(jobId)
  }, [])

  const isJobResponse = (data: GetJobsResponse): data is JobResponse => {
    return 'jobs' in data;
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
              <JobsList 
                jobs={jobsData.jobs} 
                clientId={user!.id} 
                onDeleteJob={handleDeleteClick}
              />
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