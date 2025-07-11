import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApplicationsByJobId } from '../../services/application.service'
import { PulseLoader } from 'react-spinners'
import { JobsList } from '../../components/common/JobsList'
import { ApplicationByJobIdResponse, ApplicationsResponse } from '../../types/application.types'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const JobApplicationsPage = () => {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page') || '1'

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', 'job', id, page],
    queryFn: () => getApplicationsByJobId(id!, parseInt(page)),
    staleTime: 30,
    gcTime: 1000 * 60 * 30,
  })

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString())
      return prev
    })
    window.scrollTo(0, 0)
  }

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
              <>
                <JobsList jobs={applications.applications} />
                
                {applications.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(applications.currentPage - 1)}
                      disabled={applications.currentPage === 1}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: applications.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            applications.currentPage === pageNum
                              ? 'bg-secondary-500 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(applications.currentPage + 1)}
                      disabled={applications.currentPage === applications.totalPages}
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
  )
}

export default JobApplicationsPage