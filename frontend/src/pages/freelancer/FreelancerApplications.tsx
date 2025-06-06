import { ToastContainer, toast, Bounce } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import { getApplicationsByFreelancerId } from '../../services/application.service'
import { JobsList } from '../../components/common/JobsList'
import { useAuth } from '../../context/AuthContext'
import { JobResponse } from '../../types/job.types'
import { ApplicationsByFreelancerIdResponse } from '../../types/application.types'
import { useLocation } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import { useEffect } from 'react'

const FreelancerApplications = () => {
  const { user } = useAuth()
  const location = useLocation()
  const applicationSuccess = location.state?.applicationSuccess

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['applications', 'freelancer', user!.id],
    queryFn: () => getApplicationsByFreelancerId(user!.id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (applicationSuccess) {
        toast.success('Application submitted successfully!')
        window.history.replaceState({}, document.title)
    }
  }, [applicationSuccess])

  const isJobResponse = (data: ApplicationsByFreelancerIdResponse): data is JobResponse => {
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
            <h1 className="text-2xl font-bold text-primary-500">My Applications</h1>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {jobsData && isJobResponse(jobsData) && (
              <JobsList 
                jobs={jobsData.jobs} 
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default FreelancerApplications