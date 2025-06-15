import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../../types/auth.types';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import PulseLoader from "react-spinners/PulseLoader";

interface Props {}

export const LoginPage = (_props: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading, error, success, clearToast } = useAuth();

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    if (user) {
      navigate('/jobs');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      console.log(error)
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      <div className="w-1/2 h-full">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
          alt="Freelancers collaborating" 
          className="w-full h-full object-cover shadow-xl"
        />
      </div>

      <div className="w-full md:w-1/2 bg-grey flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-primary-300'} focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="you@example.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-primary-300'} focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="••••••••"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    },
                    maxLength: {
                      value: 20,
                      message: "Password must be less than 20 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-primary-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <PulseLoader
                color="#ffffff"
                size={10}
                />
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-secondary-500 hover:text-secondary-600 font-medium" onClick={() => clearToast()}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
