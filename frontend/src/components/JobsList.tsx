import { JobCard } from '../components/JobCard';
import { Job } from '../types/job.types';

interface Props {
  jobs: Job[];
  clientId?: string;
}

export const JobsList = ({ jobs, clientId }: Props) => {
  return (
    <>  
        { jobs.length > 0 ? (
            jobs.map((job) => (
                <div className="mb-4">
                    <JobCard key={job.id} {...job} clientId={clientId} />
                </div>
            ))
        ) : (
            <h1 className="text-center text-gray-500">No job postings</h1>
        )}       
    </>
  );
}