import { useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getJobById, deleteJob } from '../services/job.service'
import { PulseLoader } from 'react-spinners'
import { Job, GetJobByIdResponse } from '../types/job.types'
import { useAuth } from '../context/AuthContext'
import { JobsList } from '../components/JobsList'
import { DeleteJobDialog } from '../components/DeleteJobDialog'
import { toast } from 'react-toastify'
import ApplicationModal from '../components/ApplicationModal'


export const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const sourceRoute = location.state?.from
  const isFromClientJobs = sourceRoute.includes('/my-jobs')
  const isApplication = sourceRoute.includes('/my-applications')
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id!, isApplication),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  const handleDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      await deleteJob(jobToDelete)
      queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      navigate('/my-jobs')
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setJobToDelete(null)
    }
  }

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId)
  }

  const handleCloseModal = (wasCreated = false) => {
    setIsModalOpen(false)
    if (wasCreated) {
        queryClient.invalidateQueries({ queryKey: ['applications', user!.id] })
        navigate('/my-applications', { 
            state: { 
                from: location.pathname,
                applicationSuccess: true 
            }
        })     
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <PulseLoader color="#222E50"/>
      </div>
    )
  }

  const isJob = (data: GetJobByIdResponse): data is Job => {
    return 'id' in data;
  }

  return (
    isJob(job!) ? (
        <div className="mt-6 p-4 flex justify-center">
            <div className="rounded-lg p-8 w-full max-w-4xl border border-gray-300">
                {isFromClientJobs ? (
                    <>
                        <JobsList 
                            jobs={[job]} 
                            clientId={user?.id === job.poster?.id ? user?.id : undefined}
                        />

                        <div className="bg-grey rounded-lg p-6 shadow-md">
                            <div className="prose max-w-none">
                                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                                <p className="whitespace-pre-wrap break-words">
                                    {job.description}
                                </p>
                            </div>
                            
                            {job.hasApplications ? (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => navigate(`/applications/by-job/${job.id}`)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Applications
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => handleDeleteClick(job.id!)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : isApplication ? (
                    <>
                        <JobsList 
                            jobs={[job]} 
                        />

                        <div className="bg-grey rounded-lg p-6 shadow-md">
                            <div className="prose max-w-none">
                                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                                <p className="whitespace-pre-wrap break-words">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {job.status === "in-progress" && (
                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                >
                                    Submit Work
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <JobsList 
                            jobs={[job]} 
                        />

                        <div className="bg-grey rounded-lg p-6 shadow-md">
                            <div className="prose max-w-none">
                                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                                <p className="whitespace-pre-wrap break-words">
                                    {job.description}
                                </p>
                            </div>
                            
                            {user?.id !== job.poster?.id && user?.role === "freelancer" && !job.hasApplied && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
                
            </div>

            {jobToDelete && (
                <DeleteJobDialog
                    isOpen={!!jobToDelete}
                    onClose={() => setJobToDelete(null)}
                    onConfirm={handleDeleteJob}
                />
            )}

            {isModalOpen && (
                <ApplicationModal
                    onClose={handleCloseModal}
                />
            )}
        </div>
        ) : (
            <div className="container mx-auto py-6 text-center text-red-500">
                Failed to load job details
            </div>
        )
    )
}

export default JobDetailsPage