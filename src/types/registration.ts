export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'rejected';

export interface Registration {
  id: string;
  userId: string;
  activityId: string;
  positionId: string;
  status: RegistrationStatus;
  waitlistOrder: number | null;
  signUpTime: string;
  confirmedTime: string | null;
}
