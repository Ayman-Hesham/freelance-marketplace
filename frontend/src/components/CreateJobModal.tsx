import { useForm } from "react-hook-form"
import { CreateJobRequest } from "../types/job.types"
import { useState } from "react"
import { PulseLoader } from "react-spinners"
import { createJob } from "../services/JobService";
interface CreateJobModalProps {
    onClose: (wasCreated?: boolean) => void
}

export const CreateJobModal = ({ onClose }: CreateJobModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<CreateJobRequest>()
  
    const onSubmit = async (data: CreateJobRequest) => {
      setIsSubmitting(true)
      try {
        const response = await createJob(data)
        if ('message' in response) {
          setIsSubmitting(false)
          return
        } 
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
        
        <h2 className="text-2xl font-bold mb-6">Create New Job</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              id="title"
              type="text"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 100, message: "Title must be less than 100 characters" }
              })}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32`}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 150, message: "Description must be at least 150 characters" },
                maxLength: { value: 300, message: "Description must be less than 300 characters" }
              })}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                id="budget"
                type="number"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.budget ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register("budget", {
                  required: "Budget is required",
                  min: { value: 1, message: "Budget must be greater than 0" }
                })}
                disabled={isSubmitting}
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (days)
              </label>
              <input
                id="deliveryTime"
                type="number"
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.deliveryTime ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register("deliveryTime", {
                  required: "Delivery time is required",
                  min: { value: 1, message: "Delivery time must be at least 1 day" }
                })}
                disabled={isSubmitting}
              />
              {errors.deliveryTime && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>
              )}
            </div>
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
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <PulseLoader color="#ffffff" size={10} />
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}