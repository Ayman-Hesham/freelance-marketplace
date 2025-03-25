import _React from 'react';
import { Navbar } from '../../components/NavBar';
import { useForm } from 'react-hook-form';

type Props = {}

export const FreelancerProfile = (_props: Props) => {
  return (
    <>
      <Navbar />
      <div className="py-6 px-8">
        <div className="bg-grey max-w-4xl mx-auto p-6 bg-grey rounded-lg shadow-md">
          <div className="grid grid-rows-12 gap-2">
            <div className="row-span-4 border-b border-gray-400">

            </div>
            <div className="row-span-8">

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
