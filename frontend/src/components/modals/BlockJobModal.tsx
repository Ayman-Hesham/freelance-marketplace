import { useForm } from "react-hook-form"
import { useState } from "react"
import { PulseLoader } from "react-spinners"
import { blockJob } from "../../services/job.service"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Job } from "../../types/job.types"

interface BlockJobModalProps {
    onClose: (wasBlocked?: boolean) => void
}

interface BlockJobFormData {
    message: string
}

export const BlockJobModal = ({ onClose }: BlockJobModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<BlockJobFormData>()
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()

    const handleFormSubmit = async (data: BlockJobFormData) => {
        setIsSubmitting(true)
        try {
            const response = await blockJob(id!, data.message)
            if ('status' in response) {
                setIsSubmitting(false)
                return 
            }

            const cachedJob = queryClient.getQueryData(['job', id])
            const freelancerId = (cachedJob as Job)?.freelancerId
            const clientId = (cachedJob as Job)?.poster.id

            queryClient.invalidateQueries({ queryKey: ['job', id] })
            queryClient.invalidateQueries({ queryKey: ['applications', 'freelancer', freelancerId] })
            queryClient.invalidateQueries({ queryKey: ['clientJobs', clientId] })
            onClose(true)
        } catch (error) {
            console.error('Block job error:', error)
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
                
                <h2 className="text-2xl font-bold mb-6">Block Job</h2>
                
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Blocking
                        </label>
                        <textarea
                            id="message"
                            className={`w-full px-3 py-2 rounded-lg border ${
                                errors.message ? "border-red-500" : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32`}
                            {...register("message", {
                                required: "Correction message is required",
                                minLength: { 
                                    value: 100, 
                                    message: "Message must be at least 100 characters" 
                                }
                            })}
                            disabled={isSubmitting}
                        />
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <PulseLoader color="#fff" size={10} />
                            ) : (
                                'Block'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}