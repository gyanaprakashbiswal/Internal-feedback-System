import { Feedback, FeedbackSummary } from '../types';

export const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    managerId: '1',
    employeeId: '2',
    strengths: 'Excellent problem-solving skills and strong technical knowledge. Arjun consistently delivers high-quality code and is always willing to help team members.',
    improvements: 'Could benefit from more proactive communication during project updates. Consider taking more initiative in team meetings.',
    sentiment: 'positive',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    acknowledged: true,
    acknowledgedAt: '2025-01-10T14:30:00Z'
  },
  {
    id: '2',
    managerId: '1',
    employeeId: '3',
    strengths: 'Outstanding project management skills and great attention to detail. Kavya has shown excellent leadership in cross-functional projects.',
    improvements: 'Focus on time management when juggling multiple priorities. Consider delegating more tasks to optimize workflow.',
    sentiment: 'positive',
    createdAt: '2025-01-08T09:15:00Z',
    updatedAt: '2025-01-08T09:15:00Z',
    acknowledged: false
  },
  {
    id: '3',
    managerId: '1',
    employeeId: '4',
    strengths: 'Creative approach to problem-solving and strong collaboration skills. Rohan brings fresh perspectives to team discussions.',
    improvements: 'Work on meeting deadlines more consistently. Consider breaking down large tasks into smaller, manageable chunks.',
    sentiment: 'neutral',
    createdAt: '2025-01-05T16:45:00Z',
    updatedAt: '2025-01-05T16:45:00Z',
    acknowledged: true,
    acknowledgedAt: '2025-01-06T08:20:00Z'
  },
  {
    id: '4',
    managerId: '1',
    employeeId: '2',
    strengths: 'Showed great improvement in code documentation and testing practices. Arjun has become more collaborative with the QA team.',
    improvements: 'Continue working on presentation skills for client meetings. Practice explaining technical concepts to non-technical stakeholders.',
    sentiment: 'positive',
    createdAt: '2024-12-20T11:30:00Z',
    updatedAt: '2024-12-20T11:30:00Z',
    acknowledged: true,
    acknowledgedAt: '2024-12-21T09:15:00Z'
  }
];

export function getFeedbackForEmployee(employeeId: string): Feedback[] {
  return mockFeedbacks.filter(f => f.employeeId === employeeId);
}

export function getFeedbackForManager(managerId: string): Feedback[] {
  return mockFeedbacks.filter(f => f.managerId === managerId);
}

export function getFeedbackSummary(managerId: string): FeedbackSummary {
  const feedbacks = getFeedbackForManager(managerId);
  return {
    totalFeedbacks: feedbacks.length,
    positiveCount: feedbacks.filter(f => f.sentiment === 'positive').length,
    neutralCount: feedbacks.filter(f => f.sentiment === 'neutral').length,
    negativeCount: feedbacks.filter(f => f.sentiment === 'negative').length,
    unacknowledgedCount: feedbacks.filter(f => !f.acknowledged).length
  };
}

export function acknowledgeFeedback(feedbackId: string): boolean {
  const feedback = mockFeedbacks.find(f => f.id === feedbackId);
  if (feedback && !feedback.acknowledged) {
    feedback.acknowledged = true;
    feedback.acknowledgedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function updateFeedback(feedbackId: string, updates: Partial<Feedback>): boolean {
  const index = mockFeedbacks.findIndex(f => f.id === feedbackId);
  if (index !== -1) {
    mockFeedbacks[index] = { ...mockFeedbacks[index], ...updates, updatedAt: new Date().toISOString() };
    return true;
  }
  return false;
}

export function createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'acknowledged'>): Feedback {
  const newFeedback: Feedback = {
    ...feedback,
    id: (mockFeedbacks.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledged: false
  };
  mockFeedbacks.push(newFeedback);
  return newFeedback;
}