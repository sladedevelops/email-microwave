'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClientSupabaseClient } from '@/lib/supabase';

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) return;

      if (!user) {
        setOnboardingCompleted(false);
        setLoading(false);
        return;
      }

      try {
        // First check session storage for quick access
        if (typeof window !== 'undefined') {
          const sessionCompleted = sessionStorage.getItem('onboardingCompleted');
          if (sessionCompleted === 'true') {
            setOnboardingCompleted(true);
            setLoading(false);
            return;
          }
        }

        // Check database for onboarding status
        const supabase = createClientSupabaseClient();
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.error('Error checking onboarding status:', error);
        }

        const completed = profile?.onboarding_completed || false;
        setOnboardingCompleted(completed);

        // Update session storage
        if (typeof window !== 'undefined' && completed) {
          sessionStorage.setItem('onboardingCompleted', 'true');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  const markOnboardingComplete = () => {
    setOnboardingCompleted(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboardingCompleted', 'true');
    }
  };

  return {
    onboardingCompleted,
    loading: authLoading || loading,
    markOnboardingComplete
  };
} 