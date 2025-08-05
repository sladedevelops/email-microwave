'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';

interface CreateEmailModalProps {
  onClose: () => void;
  onEmailCreated: () => void;
}

interface CreateEmailForm {
  subject: string;
  content: string;
  toEmail: string;
}

export default function CreateEmailModal({ onClose, onEmailCreated }: CreateEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateEmailForm>();

  const onSubmit = async (data: CreateEmailForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create email');
      }

      if (result.success) {
        reset();
        onEmailCreated();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Email</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="toEmail" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                id="toEmail"
                type="email"
                {...register('toEmail', {
                  required: 'Recipient email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="input mt-1"
                placeholder="recipient@example.com"
              />
              {errors.toEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.toEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                {...register('subject', {
                  required: 'Subject is required',
                })}
                className="input mt-1"
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                rows={6}
                {...register('content', {
                  required: 'Content is required',
                })}
                className="input mt-1 resize-none"
                placeholder="Enter email content..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Create Email'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 