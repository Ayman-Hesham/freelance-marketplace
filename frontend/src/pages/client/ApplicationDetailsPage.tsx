import { useQuery } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { Application, ApplicationByJobIdResponse } from "../../types/application.types"
import { PulseLoader } from "react-spinners"
import { JobsList } from "../../components/common/JobsList"
import { useState } from "react"
import { AcceptApplicationDialog } from "../../components/dialogs/AcceptApplicationDialog"
import { acceptApplication } from "../../services/application.service"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"

const ApplicationDetailsPage = () => {
    const queryClient = useQueryClient()
    const { id: applicationId } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const jobId = location.state?.jobId
    const { user } = useAuth()
    const [applicationToAccept, setApplicationToAccept] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleAcceptClick = (applicationId: string) => {
        setApplicationToAccept(applicationId)
    }

    const handleAcceptApplication = async () => {
        if (!applicationId) return;

        setIsLoading(true)

        try {
            const response = await acceptApplication(applicationId);
            
            if ('status' in response) {
                navigate('/my-jobs', {
                    state: { ApplicationAccepted: false }
                });
            } else {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
                    queryClient.invalidateQueries({ queryKey: ['applications', 'job', jobId], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ['applications', 'freelancer'], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ['clientJobs', user!.id], exact: false })
                ]);

                setApplicationToAccept(null);
                
                navigate('/my-jobs', {
                    state: { ApplicationAccepted: true }
                });
            }
        } catch (error) {
            toast.error('Error accepting application');
        }
    }

    const { data: application, isLoading: isApplicationLoading } = useQuery({
        queryKey: ['application', jobId, applicationId],
        queryFn: () => {
            const queriesData = queryClient.getQueriesData<ApplicationByJobIdResponse>({
                queryKey: ['applications', 'job', jobId],
                exact: false
            });

            for (const [, data] of queriesData) {
                if (data && 'applications' in data && Array.isArray(data.applications)) {
                    const targetApplication = data.applications.find(
                        (app: Application) => app.id === applicationId
                    );
                    if (targetApplication) {
                        return targetApplication;
                    }
                }
            }
            
            console.log('No application found in cache');
            return null;
        },
        enabled: !!jobId && !!applicationId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    })

    if (isApplicationLoading) return (
        <div className="h-screen flex items-center justify-center">
          <PulseLoader color="#222E50"/>
        </div>
      );


    return (
        <div className="mt-6 p-4 flex justify-center">
            <div className="rounded-lg p-8 w-full max-w-4xl border border-gray-300">
                {application && (
                    <>
                        <JobsList 
                            jobs={[application]} 
                        />
    
                <div className="bg-grey rounded-lg p-6 shadow-md">
                    <div className="prose max-w-none">
                        <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
                        <p className="whitespace-pre-wrap break-words">
                            {application?.coverLetter}
                        </p>
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => handleAcceptClick(application.id)}
                            className="px-6 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
                        >
                            Accept Application
                        </button>
                    </div>
                </div>         
                    </>
                )}
            </div>

            {applicationToAccept && (
                <AcceptApplicationDialog
                    isOpen={!!applicationToAccept}
                    onClose={() => setApplicationToAccept(null)}
                    onConfirm={handleAcceptApplication}
                    freelancerName={application?.poster.name}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}

export default ApplicationDetailsPage