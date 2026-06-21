export type ServiceQualityType = 'late' | 'early_leave' | 'absent' | 'normal';

export type ServiceEvaluationRating = 'excellent' | 'good' | 'average' | 'poor';

export interface ServiceQualityRecord {
  id: string;
  registrationId: string;
  userId: string;
  activityId: string;
  positionId: string;
  timeSlotId: string | null;
  qualityType: ServiceQualityType;
  lateMinutes: number | null;
  earlyLeaveMinutes: number | null;
  rating: ServiceEvaluationRating | null;
  comment: string;
  recordedBy: string;
  recordedAt: string;
}
