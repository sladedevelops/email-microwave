'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface EmailFormData {
  recipientName: string;
  recipientOrganization: string;
  desiredOutcome: string;
  tone: 'warm' | 'formal' | 'casual';
}

interface GeneratedEmail {
  subject: string;
  content: string;
}

export default function EmailGenerator() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EmailFormData>({
    recipientName: '',
    recipientOrganization: '',
    desiredOutcome: '',
    tone: 'formal'
  });
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to generate emails');
      return;
    }

    // Validate form
    if (!formData.recipientName.trim() || !formData.recipientOrganization.trim() || !formData.desiredOutcome.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate email');
      }

      if (result.success) {
        setGeneratedEmail(result.data);
        toast.success('Email generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate email');
      }
    } catch (error) {
      console.error('Email generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Email Microwave
          </h1>
          <p className="text-xl text-gray-600">
            Generate professional emails in seconds with AI
          </p>
        </div>

        {/* Email Generator Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient's Name */}
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient's Name *
                </label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., John Smith"
                />
              </div>

              {/* Recipient's Organization */}
              <div>
                <label htmlFor="recipientOrganization" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient's Organization/Firm *
                </label>
                <input
                  type="text"
                  id="recipientOrganization"
                  name="recipientOrganization"
                  value={formData.recipientOrganization}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., TechCorp Inc."
                />
              </div>
            </div>

            {/* Desired Outcome */}
            <div>
              <label htmlFor="desiredOutcome" className="block text-sm font-medium text-gray-700 mb-2">
                Desired Outcome *
              </label>
              <textarea
                id="desiredOutcome"
                name="desiredOutcome"
                value={formData.desiredOutcome}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what you want to achieve with this email..."
              />
            </div>

            {/* Tone */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="warm">Warm</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !user}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Microwaving Email...
                  </div>
                ) : (
                  'Microwave Email'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Email Display */}
        {generatedEmail && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Generated Email</h2>
              <div className="space-x-2">
                <button
                  onClick={() => copyToClipboard(generatedEmail.subject)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Copy Subject
                </button>
                <button
                  onClick={() => copyToClipboard(generatedEmail.content)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Copy Content
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Subject:</h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-900">{generatedEmail.subject}</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Content:</h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="whitespace-pre-wrap text-gray-900">{generatedEmail.content}</div>
              </div>
            </div>
          </div>
        )}

        {/* Not Logged In Message */}
        {!user && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Please complete the onboarding to start generating emails.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 