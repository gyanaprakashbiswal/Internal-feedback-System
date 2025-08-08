import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Feedback, User } from '../types';

interface FeedbackFormProps {
  employee: User;
  feedback?: Feedback;
  onSubmit: (feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'acknowledged'>) => void;
  onClose: () => void;
  isEdit?: boolean;
}

export function FeedbackForm({ employee, feedback, onSubmit, onClose, isEdit = false }: FeedbackFormProps) {
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');

  useEffect(() => {
    if (feedback) {
      setStrengths(feedback.strengths);
      setImprovements(feedback.improvements);
      setSentiment(feedback.sentiment);
    }
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      managerId: feedback?.managerId || '1', // This would come from auth context in real app
      employeeId: employee.id,
      strengths,
      improvements,
      sentiment
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=64748b&color=fff`}
              alt={employee.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Edit Feedback' : 'New Feedback'} for {employee.name}
              </h2>
              <p className="text-sm text-gray-600">{employee.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
              Overall Sentiment
            </label>
            <select
              id="sentiment"
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value as 'positive' | 'neutral' | 'negative')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Needs Attention</option>
            </select>
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
              Strengths & Achievements
            </label>
            <textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Highlight what they're doing well, specific achievements, and their positive contributions to the team..."
              required
            />
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
              Areas for Development
            </label>
            <textarea
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Provide constructive feedback on areas where they can grow, specific skills to develop, or processes to improve..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEdit ? 'Update Feedback' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}