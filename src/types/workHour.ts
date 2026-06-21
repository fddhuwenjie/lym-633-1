export type WorkHourStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface WorkHour {
  id: string;
  registrationId: string;
  userId: string;
  activityId: string;
  hours: number;
  status: WorkHourStatus;
  reviewerId: string | null;
  rejectReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  remarks?: string;
}
