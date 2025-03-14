import _React from 'react';
import { FilterCard } from '../components/FilterCard';
import { JobsList } from '../components/JobsList';
import { Navbar } from '../components/NavBar';

type Props = {}

export const JobsPage = (_props: Props) => {

  return (
    <>
    <Navbar />
    <div className="max-w-6xl mx-auto py-6 px-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <FilterCard />
        </div>
        <div className="col-span-9">
          <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
              <JobsList />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}