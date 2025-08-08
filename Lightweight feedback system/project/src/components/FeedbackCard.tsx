import React from 'react';
import { Feedback, User } from '../types';
import { Calendar, CheckCircle, Clock, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackCardProps {
  feedback: Feedback;
  employee?: User;
  onAcknowledge?: (feedbackId: string) => void;
  onEdit?: (feedback: Feedback) => void;
  showEmployee?: boolean;
}

export function FeedbackCard({ feedback, employee, onAcknowledge, onEdit, showEmployee = false }: FeedbackCardProps) {
  const { user } = useAuth();
  const canEdit = user?.role === 'manager' && user.id === feedback.managerId;
  const canAcknowledge = user?.role === 'employee' && !feedback.acknowledged;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {showEmployee && employee && (
            <div className="flex items-center space-x-2">
              <img
                src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=64748b&color=fff`}
                alt={employee.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-medium text-gray-900">{employee.name}</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(feedback.sentiment)}`}>
            {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit?.(feedback)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit feedback"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(feedback.createdAt)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
          <p className="text-gray-700 leading-relaxed">{feedback.strengths}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Areas for Improvement</h4>
          <p className="text-gray-700 leading-relaxed">{feedback.improvements}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {feedback.acknowledged ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Acknowledged {feedback.acknowledgedAt && formatDate(feedback.acknowledgedAt)}</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Pending acknowledgment</span>
              </div>
            )}
          </div>
          
          {canAcknowledge && (
            <button
              onClick={() => onAcknowledge?.(feedback.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}