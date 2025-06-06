import { useForm } from "react-hook-form"
import { CreateApplicationRequest } from "../../types/application.types"
import { useState, useRef, useEffect } from "react"
import { PulseLoader } from "react-spinners"
import { createApplication, getLastApplication } from "../../services/application.service"
import { Trash2, Upload } from "lucide-react"
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { Job } from "../../types/job.types"

interface Props {
    onClose: (wasCreated?: boolean) => void
}

const ApplicationModal = ({ onClose }: Props) => {
    const { id } = useParams<{ id: string }>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
    const [portfolioFileName, setPortfolioFileName] = useState<string | null>(null)
    const [portfolioError, setPortfolioError] = useState<string | null>(null)
    const portfolioInputRef = useRef<HTMLInputElement>(null)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateApplicationRequest>()
    const queryClient = useQueryClient()
    const { user } = useAuth()

    const { data: lastApplication, isLoading: isLoadingLastApplication } = useQuery({
        queryKey: ['lastApplication', user?.id],
        queryFn: () => getLastApplication(user?.id || ''),
        enabled: !!user?.id,
    })

    useEffect(() => {
        if (lastApplication && ('coverLetter' in lastApplication)) {
            if (lastApplication.coverLetter) {
                setValue('coverLetter', lastApplication.coverLetter)
            }

            if (lastApplication.portfolio) {
                fetch(lastApplication.portfolio)
                    .then(response => response.blob())
                    .then(blob => {
                        const urlParts = lastApplication.portfolio.split('/')
                        const fileNameWithParams = urlParts[urlParts.length - 1]
                        const fileName = fileNameWithParams.split('?')[0]
                        const originalFileName = fileName.split('__')[1]

                        if (originalFileName) {
                            const file = new File([blob], originalFileName, { type: blob.type })
                            setPortfolioFile(file)
                            setPortfolioFileName(originalFileName)
                        }
                    })
                    .catch(error => console.error('Error fetching portfolio file:', error))
            }
        }
    }, [lastApplication, setValue])

    const validateFileSize = (file: File, maxSize: number, errorMessage: string): boolean => {
        if (file.size > maxSize) {
            alert(errorMessage)
            return false
        }
        return true
    }

    const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const maxSize = 16 * 1024 * 1024 
            
            if (!validateFileSize(file, maxSize, 'File size must be less than 16MB')) {
                event.target.value = ''
                return
            }

            setPortfolioFile(file)
            setPortfolioFileName(file.name)
        }
    }

    const handleDeletePortfolio = () => {
        setPortfolioFile(null)
        setPortfolioFileName(null)
        if (portfolioInputRef.current) {
            portfolioInputRef.current.value = ''
        }
    }

    const onSubmit = async (data: CreateApplicationRequest) => {
        if (!portfolioFile) {
            setPortfolioError('Portfolio file is required')
            return
        }
        setPortfolioError(null)
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('coverLetter', data.coverLetter)
            formData.append('jobId', id as string)
            formData.append('portfolio', portfolioFile)

            const response = await createApplication(formData)
            if ('message' in response) {
                setIsSubmitting(false)
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
            onClose(true)
        } catch (error) {
            console.error('Creation error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }
      
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full">
                <button 
                    onClick={() => onClose(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                >
                    ✕
                </button>
                
                <h2 className="text-2xl font-bold mb-6">Submit Application</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Letter
                        </label>
                        <textarea
                            id="coverLetter"
                            className={`w-full px-3 py-2 rounded-lg border ${
                                errors.coverLetter ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32`}
                            {...register("coverLetter", {
                                maxLength: { value: 300, message: "Cover letter must be less than 300 characters" }
                            })}
                            disabled={isSubmitting}
                        />
                        {errors.coverLetter && (
                            <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Portfolio (Required)
                        </label>
                        <div className={`flex items-center justify-between border rounded-md px-3 py-2 ${
                            portfolioError ? "border-red-500" : "border-gray-300"
                        }`}>
                            <span className="text-gray-800 text-sm truncate mr-2">
                                {portfolioFileName || 'No file selected'}
                            </span>
                            <div className="flex items-center gap-2">
                                {portfolioFileName && (
                                    <button
                                        type="button"
                                        onClick={handleDeletePortfolio}
                                        className="text-red-500 hover:text-red-700"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => portfolioInputRef.current?.click()}
                                    className="text-blue-500 hover:text-blue-700"
                                    disabled={isSubmitting}
                                >
                                    <Upload className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={portfolioInputRef}
                            onChange={handlePortfolioChange}
                            className="hidden"
                        />
                        {portfolioError && (
                            <p className="mt-1 text-sm text-red-600">{portfolioError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 16MB
                        </p>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-2 rounded-md transition-colors disabled:bg-white disabled:cursor-not-allowed min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting || isLoadingLastApplication ? (
                                <PulseLoader color="#222E50" size={10} />
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ApplicationModal