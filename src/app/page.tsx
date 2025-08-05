'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import AuthForm from '@/components/AuthForm';
import OnboardingModal from '@/components/OnboardingModal';

type AuthMode = 'signin' | 'signup';

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const { user, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const router = useRouter();

  // Show onboarding modal if user is authenticated but hasn't completed onboarding
  const showOnboarding = Boolean(user && !onboardingLoading && onboardingCompleted === false);

  // Redirect to dashboard if user is authenticated and has completed onboarding
  if (!loading && !onboardingLoading && user && onboardingCompleted === true) {
    router.push('/dashboard');
    return null;
  }

  // Show loading spinner while checking authentication and onboarding status
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${showOnboarding ? 'pointer-events-none' : ''}`}>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Microwave
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <AuthForm mode={mode} />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {mode === 'signin' ? 'Create new account' : 'Sign in instead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={markOnboardingComplete}
      />
    </>
  );
} 