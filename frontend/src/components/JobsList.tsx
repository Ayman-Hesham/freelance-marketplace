import { JobCard } from '../components/JobCard';
import { Job } from '../types/job.types';
import { Application } from '../types/application.types';
import { useLocation } from 'react-router-dom';

interface Props {
  jobs: Job[] | Application[];
  clientId?: string;
  onDeleteJob?: (jobId: string) => void;
}

export const JobsList = ({ jobs, clientId, onDeleteJob }: Props) => {
  const location = useLocation();
  const inApplicationsPage = location.pathname.includes('/applications');

  const isApplication = (item: Job | Application): item is Application => {
    return 'portfolio' in item;
  };

  return (
    <>  
        {jobs.length > 0 ? (
            jobs.map((item) => {
                const isApplicationItem = isApplication(item);
                return (
                    <div key={item.id} className="mb-4">
                        <JobCard 
                            id={item.id}
                            title={isApplicationItem ? undefined : (item as Job).title}
                            deliveryTime={isApplicationItem ? undefined : (item as Job).deliveryTime}
                            budget={isApplicationItem ? undefined : (item as Job).budget}
                            status={isApplicationItem ? undefined : (item as Job).status}
                            hasApplications={isApplicationItem ? true : (item as Job).hasApplications}
                            portfolio={isApplicationItem ? (item as Application).portfolio : undefined}
                            poster={item.poster}
                            clientId={clientId}
                            onDelete={onDeleteJob ? () => onDeleteJob(item.id!) : undefined}
                        />
                    </div>
                );
            })
        ) : (
            inApplicationsPage ? (
                <h1 className="text-center text-gray-500">No applications</h1>
            ) : (
                <h1 className="text-center text-gray-500">No job postings</h1>
            )
        )}       
    </>
  );
}