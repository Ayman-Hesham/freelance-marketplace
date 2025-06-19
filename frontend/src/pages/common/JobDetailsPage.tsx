import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getJobById, deleteJob } from '../../services/job.service'
import { PulseLoader } from 'react-spinners'
import { Job, GetJobByIdResponse } from '../../types/job.types'
import { useAuth } from '../../hooks/useAuth'
import { JobsList } from '../../components/common/JobsList'
import { DeleteJobDialog } from '../../components/dialogs/DeleteJobDialog'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import ApplicationModal from '../../components/modals/ApplicationModal'
import { Trash2, Upload } from 'lucide-react'
import { acceptDeliverable, submitDeliverable } from '../../services/application.service'
import { CompleteJobDialog } from '../../components/dialogs/CompleteJobDialog'
import { RequestCorrectionModal } from '../../components/modals/RequestCorrectionModal'
import { BlockJobModal } from '../../components/modals/BlockJobModal'


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
  const [showDeliverableField, setShowDeliverableField] = useState(false)
  const deliverableInputRef = useRef<HTMLInputElement>(null)
  const [deliverable, setDeliverable] = useState<File | null>(null)
  const [deliverableFileName, setDeliverableFileName] = useState<string | null>(null)
  const [deliverableError, setDeliverableError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobToAccept, setJobToAccept] = useState<string | null>(null)
  const [isRequestingCorrection, setIsRequestingCorrection] = useState(false)
  const [isBlockingJob, setIsBlockingJob] = useState(false)
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)
  const [isAcceptSuccess, setIsAcceptSuccess] = useState(false)

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
      navigate('/my-jobs', {
        state: {
          from: location.pathname,
          jobDeleted: true
        }
      })
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

  const handleDeliverableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
        const maxSize = 16 * 1024 * 1024 
        
        if (file.size > maxSize) {
            toast.warning("File size must be less than 16MB")
            event.target.value = ''
            return
        }

        setDeliverable(file)
        setDeliverableFileName(file.name)
        }
    }

  const handleDeleteDeliverable = () => {
    setDeliverable(null)
        setDeliverableFileName(null)
        if (deliverableInputRef.current) {
            deliverableInputRef.current.value = ''
        }
  }

  const handleSubmitDeliverable = async (deliverable: File) => {
    if (!deliverable) {
        setDeliverableError('Deliverable file is required')
        return
    }
    setDeliverableError(null)
    setIsSubmitting(true)
    try {
        const formData = new FormData()
        formData.append('deliverable', deliverable)

        const response = await submitDeliverable(id!, formData)
        if ('status' in response) {
            setIsSubmitting(false)
            toast.error('Failed to submit deliverable')
            return
        } 

        const cachedJob = queryClient.getQueryData(['job', id])
        const freelancerId = (cachedJob as Job)?.freelancerId

        queryClient.invalidateQueries({ queryKey: ['job', id] })
        queryClient.invalidateQueries({ queryKey: ['applications', 'freelancer', freelancerId] })
        setIsSubmitSuccess(true)
    } catch (error) {
        console.error('Submission error:', error)
    } finally {
        setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isSubmitSuccess) {
      toast.success('Deliverable submitted successfully')
      setIsSubmitSuccess(false)
    }
  }, [isSubmitSuccess])

  useEffect(() => {
    if (isAcceptSuccess) {
      toast.success('Job completed successfully')
      setIsAcceptSuccess(false)
    }
  }, [isAcceptSuccess])

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

  if (!isJob(job!)) {
    queryClient.invalidateQueries({ queryKey: ['job', id] });
    navigate(sourceRoute || '/jobs', {
        state: {
            from: location.pathname,
            jobLoadError: true
        }
    });
    return null;
  }

  const handleAcceptClick = (jobId: string) => {
    setJobToAccept(jobId)
  }

  const handleAcceptJob = async () => {
    if (!jobToAccept) return

    try {
      const response = await acceptDeliverable(jobToAccept)
      if ('status' in response) {
        toast.error('Failed to accept job')
        return
      }
      
      const cachedJob = queryClient.getQueryData(['job', id])
    const clientId = (cachedJob as Job)?.poster.id

    if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['clientJobs', clientId] })
    }

    queryClient.invalidateQueries({ queryKey: ['job', id] })
    queryClient.invalidateQueries({ queryKey: ['applications', 'freelancer', user!.id] })
    queryClient.invalidateQueries({ queryKey: ['applications', 'job', id] })
    setIsAcceptSuccess(true)    
    } catch (error) {
      toast.error('Failed to accept job')
    } finally {
      setJobToAccept(null)
    }
  }

  const handleRequestCorrection = async (wasSent?: boolean) => {
    setIsRequestingCorrection(false)
    if (wasSent) {
        toast.success('Correction request sent')
    } 
  }

  const handleBlockJob = async (wasBlocked?: boolean) => {
    setIsBlockingJob(false)
    if (wasBlocked) {
        toast.success('Job blocked successfully')
    }
  }

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
            <div className="rounded-lg p-4 w-full max-w-4xl border border-gray-300">
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

                                {job.status === "Pending Approval" && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-4">Deliverable</h3>
                                        <p className="whitespace-pre-wrap break-words bg-white p-2 rounded-md">
                                        <a 
                                            href={job.deliverable!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {decodeURIComponent(job.deliverable?.split('__').pop()?.split('?')[0] || '')}
                                        </a>
                                        </p>

                                        <div className="mt-8 flex justify-center gap-4">
                                            <button 
                                                className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                                onClick={() => handleAcceptClick(job.id!)}
                                            >
                                                Accept Deliverable
                                            </button>
                                            <button 
                                                className="px-6 py-2 bg-white rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsRequestingCorrection(true)}
                                            >
                                                Request Correction
                                            </button>
                                        </div>
                                    </div>         
                                )}
                            </div>

                            {job.status === "Blocked by Admin" && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">Reason for Blocking</h3>
                                    <p className="whitespace-pre-wrap break-words bg-white p-2 rounded-md">
                                        {job.blockMessage}
                                    </p>
                                </div>
                            )}

                            {job.status === "Completed" && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">Deliverable</h3>
                                    <p className="whitespace-pre-wrap break-words bg-white p-2 rounded-md">
                                        <a 
                                            href={job.deliverable!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {decodeURIComponent(job.deliverable?.split('__').pop()?.split('?')[0] || '')}
                                        </a>
                                    </p>
                                </div>
                            )}
                            
                            {job.status === "Open" && job.hasApplications ? (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => navigate(`/applications/by-job/${job.id}`)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Applications
                                    </button>
                                </div>
                            ) : job.status === "Open" || job.status === "Blocked by Admin" ? (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => handleDeleteClick(job.id!)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : null}
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

                            {(job.status === "In-Progress" || job.status === "Correction") && (
                                <>
                                    {job.status === "Correction" && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-4">Correction Message</h3>
                                            <p className="whitespace-pre-wrap break-words">
                                                {job.correctionMessage}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-8">
                                        {showDeliverableField ? (
                                            <div className="space-y-6">
                                                <div className="w-full">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Deliverable
                                                    </label>
                                                    <div className={`flex items-center justify-between border rounded-md px-3 py-2 bg-white ${
                                                        deliverableError ? "border-red-500" : "border-gray-300"
                                                    }`}>
                                                        <span className="text-gray-800 text-sm truncate mr-2">
                                                            {deliverableFileName || 'No file selected'}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {deliverable && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleDeleteDeliverable}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => deliverableInputRef.current?.click()}
                                                                className="text-blue-500 hover:text-blue-700"
                                                                disabled={isSubmitting}
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        ref={deliverableInputRef}
                                                        onChange={handleDeliverableChange}
                                                        className="hidden"
                                                    />
                                                    {deliverableError && (
                                                        <p className="mt-1 text-sm text-red-600">{deliverableError}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Maximum file size: 16MB
                                                    </p>
                                                </div>
                    
                                                <div className="flex justify-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDeliverableField(false)}
                                                        className="flex items-center justify-center px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors min-w-[120px]"
                                                        disabled={isSubmitting}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        onClick={() => handleSubmitDeliverable(deliverable!)}
                                                        className="flex items-center justify-center bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-2 rounded-md transition-colors disabled:bg-white disabled:cursor-not-allowed min-w-[120px]"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <PulseLoader color="#222E50" size={10} />
                                                        ) : (
                                                            'Submit'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => setShowDeliverableField(true)}
                                                    className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                                >
                                                    {job.status === "Correction" ? "Re-Submit Work" : "Submit Work"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {job.status === "Pending Approval" && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">Deliverable</h3>
                                    <p className="whitespace-pre-wrap break-words bg-white p-2 rounded-md">
                                        <a 
                                            href={job.deliverable!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {decodeURIComponent(job.deliverable?.split('__').pop()?.split('?')[0] || '')}
                                        </a>
                                    </p>
                                </div>
                            )}
                        </div>              
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

                            {user?.role === "admin" && job.status === "Open" && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => setIsBlockingJob(true)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Block Job
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

            {jobToAccept && (
                <CompleteJobDialog
                    isOpen={!!jobToAccept}
                    onClose={() => setJobToAccept(null)}
                    onConfirm={handleAcceptJob}
                />
            )}

            {isRequestingCorrection && (
                <RequestCorrectionModal
                    onClose={handleRequestCorrection}
                />
            )}

            {isBlockingJob && (
                <BlockJobModal
                    onClose={handleBlockJob}
                />
            )}
        </div>
        </>
    )
}

export default JobDetailsPage