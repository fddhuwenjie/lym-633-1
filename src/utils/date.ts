import { format, parseISO, differenceInMinutes, isAfter, isBefore, isEqual } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: zhCN });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm', { locale: zhCN });
}

export function calculateHours(startTime: string, endTime: string): number {
  const diffMinutes = differenceInMinutes(parseISO(endTime), parseISO(startTime));
  return Math.round((diffMinutes / 60) * 100) / 100;
}

export function isTimeOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  const s1 = parseISO(start1);
  const e1 = parseISO(end1);
  const s2 = parseISO(start2);
  const e2 = parseISO(end2);
  
  return isBefore(s1, e2) && isAfter(e1, s2);
}

export function isAfterDate(date1: string, date2: string): boolean {
  return isAfter(parseISO(date1), parseISO(date2));
}

export function isBeforeDate(date1: string, date2: string): boolean {
  return isBefore(parseISO(date1), parseISO(date2));
}

export function isEqualDate(date1: string, date2: string): boolean {
  return isEqual(parseISO(date1), parseISO(date2));
}
