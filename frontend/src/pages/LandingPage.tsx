import _React from 'react';
import { Search, Clock, Shield, Users, ArrowRight } from 'lucide-react';
import { FeatureCard } from '../components/FeatureCard';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Find Opportunities",
      description: "Connect with clients looking for your unique skills and expertise. Our matching system pairs you with projects that align perfectly with your professional background."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Work Your Way",
      description: "Choose projects that match your schedule and career goals. Enjoy the flexibility to select assignments that fit your preferred work style and availability."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Collaboration",
      description: "Work with confidence in a trusted professional environment. Our platform ensures seamless communication tools for successful project delivery."
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="min-h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-primary-500">
                The Future of
                <span className="text-secondary-500"> Freelancing</span>
              </h1>
              <p className="text-xl text-primary-400">
                A platform where skilled professionals and innovative businesses connect, collaborate, and create exceptional results together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <button className="px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 group bg-primary-500 text-white hover:bg-primary-600">
                    Hire Talent
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 group bg-secondary-500 text-white hover:bg-secondary-600">
                    Find Work
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
                alt="Remote work collaboration"
                className="rounded-2xl shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-500">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-16">
            Why Choose Our Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            <Users className="w-16 h-16 text-secondary-500 mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-500 mb-4">
              Join Our Global Community
            </h2>
            <p className="text-xl text-primary-400 max-w-2xl">
              Whether you're looking to hire or be hired, our platform connects talented professionals with great opportunities worldwide.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}; 