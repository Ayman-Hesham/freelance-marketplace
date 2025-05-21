import { JobCard } from '../components/JobCard';
import { Job } from '../types/job.types';
import { useLocation } from 'react-router-dom';

interface Props {
  jobs: Job[];
  clientId?: string;
  onDeleteJob?: (jobId: string) => void;
}

export const JobsList = ({ jobs, clientId, onDeleteJob }: Props) => {
  const location = useLocation();
  const inApplicationsPage = location.pathname.includes('/my-applications');

  return (
    <>  
        { jobs.length > 0 ? (
            jobs.map((job) => (
                <div className="mb-4">
                    <JobCard key={job.id} {...job} clientId={clientId} onDelete={onDeleteJob ? () => onDeleteJob(job.id!) : undefined} />
                </div>
            ))
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