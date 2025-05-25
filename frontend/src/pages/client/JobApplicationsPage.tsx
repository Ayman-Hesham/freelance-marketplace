import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApplicationsByJobId } from '../../services/application.service'
import { PulseLoader } from 'react-spinners'
import { JobsList } from '../../components/JobsList'
import { ApplicationByJobIdResponse, ApplicationsResponse } from '../../types/application.types'

const JobApplicationsPage = () => {
  const { id } = useParams()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', 'job', id],
    queryFn: () => getApplicationsByJobId(id!),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  const isApplicationResponse = (data: ApplicationByJobIdResponse): data is ApplicationsResponse => {
    return data && 'applications' in data && Array.isArray(data.applications);
  }

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <PulseLoader color="#222E50"/>
    </div>
  );

  return (
    <div className="mt-6 p-4 flex justify-center">
        <div className="rounded-lg p-8 w-full max-w-4xl border border-gray-300">
          <div className="flex justify-between items-center mb-6 px-2">
            <h1 className="text-2xl font-bold text-primary-500">Job Applications</h1>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {applications && isApplicationResponse(applications) && (
              <JobsList 
                jobs={applications.applications}
              />
            )}
          </div>
        </div>
    </div>
  )
}

export default JobApplicationsPage