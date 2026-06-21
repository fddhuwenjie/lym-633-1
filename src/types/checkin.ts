export type CheckinStatus = 'not_started' | 'checked_in' | 'checked_out' | 'absent';

export interface CheckinRecord {
  id: string;
  registrationId: string;
  userId: string;
  checkinTime: string | null;
  checkoutTime: string | null;
  status: CheckinStatus;
}
