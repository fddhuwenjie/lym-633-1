export type ActivityStatus = 'draft' | 'recruiting' | 'ongoing' | 'ended' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  location: string;
  startTime: string;
  endTime: string;
  status: ActivityStatus;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  activityId: string;
  name: string;
  description: string;
  totalQuota: number;
  requirements: string[];
  responsibleId: string;
}
