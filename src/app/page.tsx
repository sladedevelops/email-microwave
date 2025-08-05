'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import EmailGenerator from '@/components/EmailGenerator';
import OnboardingModal from '@/components/OnboardingModal';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding modal if user is not authenticated or hasn't completed onboarding
    const shouldShowOnboarding = Boolean((!user && !loading) || (user && !onboardingLoading && onboardingCompleted === false));
    setShowOnboarding(shouldShowOnboarding);
  }, [user, loading, onboardingLoading, onboardingCompleted]);

  // Show loading spinner while checking authentication and onboarding status
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Email Generator (always visible but interaction blocked during onboarding) */}
      <div className={showOnboarding ? 'pointer-events-none' : ''}>
        <EmailGenerator />
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={markOnboardingComplete}
      />
    </>
  );
} 