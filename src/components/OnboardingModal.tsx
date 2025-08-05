'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClientSupabaseClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface OnboardingFormData {
  fullName: string;
  school: string;
  grade: string;
  major: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const gradeOptions = [
  'Freshman',
  'Sophomore', 
  'Junior',
  'Senior',
  'Graduate Student',
  'Other'
];

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: '',
    school: '',
    grade: '',
    major: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        school: '',
        grade: '',
        major: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OnboardingFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.school.trim()) {
      newErrors.school = 'School is required';
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('You must be logged in to complete onboarding');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClientSupabaseClient();
      
      // Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.fullName,
            school: formData.school,
            grade: formData.grade,
            major: formData.major,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            school: formData.school,
            grade: formData.grade,
            major: formData.major,
            onboarding_completed: true
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Store onboarding completion in session storage as backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onboardingCompleted', 'true');
      }

      toast.success('Onboarding completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Failed to save onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof OnboardingFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Email Microwave!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Let's get to know you better to personalize your experience.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* School */}
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                School *
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.school ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your school name"
              />
              {errors.school && (
                <p className="mt-1 text-sm text-red-600">{errors.school}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                Grade *
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.grade ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select your grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>

            {/* Major */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                Major *
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.major ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your major"
              />
              {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing Onboarding...
                  </div>
                ) : (
                  'Complete Onboarding'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 