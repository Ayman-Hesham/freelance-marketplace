import _React, { useState } from 'react';
import { JobCard } from '../components/JobCard';

type Props = {}

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Build an e-commerce website for a clothing business",
    posterName: "John Doe",
    deliveryTime: 9,
    budget: 600
  },
  {
    id: 2,
    title: "Perform software testing on web application",
    posterName: "Ash Reed",
    deliveryTime: 3,
    budget: 200
  },
  {
    id: 3,
    title: "Build an AI chatbot",
    posterName: "Ezra Thorn",
    deliveryTime: 2,
    budget: 150
  },
  {
    id: 4,
    title: "Develop a mobile application",
    posterName: "Finn Jett",
    deliveryTime: 14,
    budget: 700
  },
  {
    id: 5,
    title: "Conduct penetration testing and vulnerability assessment",
    posterName: "Myla Bryn",
    deliveryTime: 5,
    budget: 300
  },
  {
    id: 6,
    title: "Perform smart contract audit for crypto token",
    posterName: "Nova Frey",
    deliveryTime: 1,
    budget: 100
  },
  {
    id: 7,
    title: "Develop a mobile application",
    posterName: "Finn Jett",
    deliveryTime: 14,
    budget: 700
  }
];

export const JobsList = (_props: Props) => {
  const [jobs] = useState(SAMPLE_JOBS);

  return (
    <>  
        { jobs ? (
            jobs.map((job) => (
                <div className="mb-4">
                    <JobCard key={job.id} {...job} />
                </div>
            ))
        ) : (
            <h1>No job postings</h1>
        )}       
    </>
  );
}