import React, { useState } from 'react';
import { Layout } from './Layout';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackForm } from './FeedbackForm';
import { useAuth } from '../contexts/AuthContext';
import { Users, MessageSquare, ThumbsUp, AlertCircle, Plus } from 'lucide-react';
import { getFeedbackForManager, getFeedbackSummary, createFeedback, updateFeedback } from '../data/mockData';
import { Feedback, User } from '../types';

const mockTeamMembers: User[] = [
  {
    id: '2',
    name: 'Arjun Patel',
    email: 'arjun@company.com',
    role: 'employee',
    managerId: '1',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Kavya Reddy',
    email: 'kavya@company.com',
    role: 'employee',
    managerId: '1',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Rohan Kumar',
    email: 'rohan@company.com',
    role: 'employee',
    managerId: '1',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export function ManagerDashboard() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState(() => getFeedbackForManager(user?.id || '1'));
  const [summary, setSummary] = useState(() => getFeedbackSummary(user?.id || '1'));
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmitFeedback = (feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'acknowledged'>) => {
    if (editingFeedback) {
      updateFeedback(editingFeedback.id, feedbackData);
      setFeedbacks(getFeedbackForManager(user?.id || '1'));
    } else {
      createFeedback(feedbackData);
      setFeedbacks(getFeedbackForManager(user?.id || '1'));
      setSummary(getFeedbackSummary(user?.id || '1'));
    }
    setShowForm(false);
    setSelectedEmployee(null);
    setEditingFeedback(null);
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setSelectedEmployee(mockTeamMembers.find(m => m.id === feedback.employeeId) || null);
    setShowForm(true);
  };

  const getEmployeeById = (id: string) => mockTeamMembers.find(m => m.id === id);

  const statCards = [
    {
      title: 'Team Members',
      value: mockTeamMembers.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Feedback',
      value: summary.totalFeedbacks,
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Positive Reviews',
      value: summary.positiveCount,
      icon: ThumbsUp,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pending Acknowledgment',
      value: summary.unacknowledgedCount,
      icon: AlertCircle,
      color: 'bg-amber-500'
    }
  ];

  return (
    <Layout title="Manager Dashboard">
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

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Team</h2>
            <p className="text-gray-600 mt-1">Manage feedback for your team members</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTeamMembers.map((member) => {
                const memberFeedbacks = feedbacks.filter(f => f.employeeId === member.id);
                const latestFeedback = memberFeedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
                return (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=64748b&color=fff`}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">{memberFeedbacks.length}</span> feedback(s) given
                      {latestFeedback && (
                        <div className="mt-1">
                          Last: {new Date(latestFeedback.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedEmployee(member);
                        setEditingFeedback(null);
                        setShowForm(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Give Feedback</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
            <p className="text-gray-600 mt-1">All feedback you've provided to your team</p>
          </div>
          <div className="p-6">
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                <p className="text-gray-600">Start by giving feedback to your team members above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedbacks
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      employee={getEmployeeById(feedback.employeeId)}
                      onEdit={handleEditFeedback}
                      showEmployee={true}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && selectedEmployee && (
        <FeedbackForm
          employee={selectedEmployee}
          feedback={editingFeedback || undefined}
          onSubmit={handleSubmitFeedback}
          onClose={() => {
            setShowForm(false);
            setSelectedEmployee(null);
            setEditingFeedback(null);
          }}
          isEdit={!!editingFeedback}
        />
      )}
    </Layout>
  );
}