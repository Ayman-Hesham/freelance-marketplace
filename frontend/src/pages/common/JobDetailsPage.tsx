import { useRef, useState } from 'react'
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
import { submitDeliverable } from '../../services/application.service'


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

  const validateFileSize = (file: File, maxSize: number, errorMessage: string): boolean => {
    if (file.size > maxSize) {
        alert(errorMessage)
        return false
    }
    return true
  }

  const handleDeliverableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
        const maxSize = 16 * 1024 * 1024 
        
        if (!validateFileSize(file, maxSize, 'File size must be less than 16MB')) {
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
        const clientId = (cachedJob as Job)?.poster.id

        if (clientId) {
            queryClient.invalidateQueries({ queryKey: ['clientJobs', clientId] })
        }

        queryClient.invalidateQueries({ queryKey: ['job', id] })
        queryClient.invalidateQueries({ queryKey: ['applications', 'freelancer', user!.id] })
        queryClient.invalidateQueries({ queryKey: ['applications', 'job', id] })
        navigate('/my-applications', {
            state: {
                from: location.pathname,
                submitSuccess: true
            }
        })
    } catch (error) {
        console.error('Submission error:', error)
    } finally {
        setIsSubmitting(false)
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
                            
                            {job.status === "Open" && job.hasApplications ? (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => navigate(`/applications/by-job/${job.id}`)}
                                        className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                                    >
                                        Applications
                                    </button>
                                </div>
                            ) : job.status === "Open" ? (
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

                            {job.status === "In-Progress" && (
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
                                            Submit Work
                                        </button>
                                    </div>
                                )}
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
        </>
        ) : (
            <div className="container mx-auto py-6 text-center text-red-500">
                Failed to load job details
            </div>
        )
    )
}

export default JobDetailsPage