import { Activity, Position, User, Registration, WorkHour } from '../types';
import { isTimeOverlap, isBeforeDate } from './date';

export function validateActivityNotEnded(activity: Activity): boolean {
  return activity.status !== 'ended' && activity.status !== 'cancelled';
}

export function validateActivityRecruiting(activity: Activity): boolean {
  return activity.status === 'recruiting';
}

export function validatePositionRequirements(user: User, position: Position): { valid: boolean; missing: string[] } {
  const missing = position.requirements.filter(req => !user.skills.includes(req));
  return {
    valid: missing.length === 0,
    missing
  };
}

export function validateTimeConflict(
  userId: string,
  activity: Activity,
  registrations: Registration[],
  allActivities: Activity[]
): { hasConflict: boolean; conflictActivity?: Activity } {
  const userConfirmedRegs = registrations.filter(
    r => r.userId === userId && r.status === 'confirmed'
  );
  
  for (const reg of userConfirmedRegs) {
    const regActivity = allActivities.find(a => a.id === reg.activityId);
    if (regActivity && regActivity.id !== activity.id) {
      if (isTimeOverlap(activity.startTime, activity.endTime, regActivity.startTime, regActivity.endTime)) {
        return { hasConflict: true, conflictActivity: regActivity };
      }
    }
  }
  
  return { hasConflict: false };
}

export function validateCheckoutTime(checkinTime: string, checkoutTime: string): boolean {
  return isBeforeDate(checkinTime, checkoutTime);
}

export function validateSelfReview(reviewerId: string, workHour: WorkHour): boolean {
  return reviewerId !== workHour.userId;
}

export function validateRegistrationBeforeActivityEnd(
  activity: Activity
): boolean {
  const now = new Date().toISOString();
  return isBeforeDate(now, activity.endTime) && activity.status !== 'ended';
}

export function validatePositionQuota(
  positionId: string,
  registrations: Registration[]
): { hasQuota: boolean; confirmedCount: number; waitlistCount: number } {
  const positionRegs = registrations.filter(r => r.positionId === positionId);
  const confirmedCount = positionRegs.filter(r => r.status === 'confirmed').length;
  const waitlistCount = positionRegs.filter(r => r.status === 'waitlist').length;
  
  return {
    hasQuota: false,
    confirmedCount,
    waitlistCount
  };
}
