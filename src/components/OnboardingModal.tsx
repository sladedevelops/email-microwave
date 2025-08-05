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
  email: string;
  password: string;
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
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: '',
    school: '',
    grade: '',
    major: '',
    email: '',
    password: ''
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
        major: '',
        email: '',
        password: ''
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First, create the Supabase account
      const signUpResult = await signUp(formData.email, formData.password, formData.fullName);
      
      if (!signUpResult.success) {
        toast.error(signUpResult.error || 'Failed to create account');
        return;
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then save the profile information
      const supabase = createClientSupabaseClient();
      
      // Get the current user with retry logic
      let user = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (!user && retries < maxRetries) {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
        }
        
        if (currentUser) {
          user = currentUser;
          break;
        }
        
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!user) {
        // If we still can't get the user, try to get it from the signup result
        if (signUpResult.user) {
          user = signUpResult.user;
        } else {
          toast.error('Failed to get user information. Please try signing in manually.');
          return;
        }
      }

      // Save profile information
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          school: formData.school,
          grade: formData.grade,
          major: formData.major,
          onboarding_completed: true
        });

      if (profileError) {
        console.error('Error saving profile:', profileError);
        toast.error('Account created but failed to save profile information');
        return;
      }

      // Store onboarding completion in session storage as backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onboardingCompleted', 'true');
      }

      toast.success('Account created and onboarding completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
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
              Create your account and let's get to know you better.
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Account & Complete Onboarding'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 