export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  managerId?: string;
  avatar?: string;
}

export interface Feedback {
  id: string;
  managerId: string;
  employeeId: string;
  strengths: string;
  improvements: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  updatedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface Team {
  manager: User;
  members: User[];
}

export interface FeedbackSummary {
  totalFeedbacks: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  unacknowledgedCount: number;
}