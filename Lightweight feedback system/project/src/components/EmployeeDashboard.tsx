import React, { useState } from 'react';
import { Layout } from './Layout';
import { FeedbackCard } from './FeedbackCard';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { getFeedbackForEmployee, acknowledgeFeedback } from '../data/mockData';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState(() => getFeedbackForEmployee(user?.id || '2'));

  const handleAcknowledgeFeedback = (feedbackId: string) => {
    const success = acknowledgeFeedback(feedbackId);
    if (success) {
      setFeedbacks(getFeedbackForEmployee(user?.id || '2'));
    }
  };

  const totalFeedbacks = feedbacks.length;
  const acknowledgedCount = feedbacks.filter(f => f.acknowledged).length;
  const pendingCount = totalFeedbacks - acknowledgedCount;
  const positiveCount = feedbacks.filter(f => f.sentiment === 'positive').length;

  const statCards = [
    {
      title: 'Total Feedback',
      value: totalFeedbacks,
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Acknowledged',
      value: acknowledgedCount,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'bg-amber-500'
    },
    {
      title: 'Positive Reviews',
      value: positiveCount,
      icon: TrendingUp,
      color: 'bg-emerald-500'
    }
  ];

  return (
    <Layout title="My Feedback">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Feedback Timeline</h2>
                <p className="text-gray-600 mt-1">Review all feedback you've received from your manager</p>
              </div>
              
              {pendingCount > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{pendingCount} pending review</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                <p className="text-gray-600">Your manager hasn't provided any feedback yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedbacks
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      onAcknowledge={handleAcknowledgeFeedback}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Growth Insights */}
        {feedbacks.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Growth Insights</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Feedback Response Rate</span>
                <span className="font-semibold text-blue-600">{Math.round((acknowledgedCount / totalFeedbacks) * 100)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Positive Feedback Ratio</span>
                <span className="font-semibold text-green-600">{Math.round((positiveCount / totalFeedbacks) * 100)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(acknowledgedCount / totalFeedbacks) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Keep engaging with feedback to show your commitment to growth!</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}