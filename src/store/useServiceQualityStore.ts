import { create } from 'zustand';
import { ServiceQualityRecord, ServiceQualityType, ServiceEvaluationRating, TimeSlot } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockServiceQualityRecords } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { useActivityStore } from './useActivityStore';
import { calculateHours } from '../utils/date';

interface ServiceQualityStore {
  records: ServiceQualityRecord[];
  loadRecords: () => void;
  getRecordsByUserId: (userId: string) => ServiceQualityRecord[];
  getRecordsByActivityId: (activityId: string) => ServiceQualityRecord[];
  getRecordsByPositionId: (positionId: string) => ServiceQualityRecord[];
  getRecordsByRegistrationId: (registrationId: string) => ServiceQualityRecord[];
  getRecordsByTimeSlotId: (timeSlotId: string) => ServiceQualityRecord[];
  addRecord: (data: Omit<ServiceQualityRecord, 'id' | 'recordedAt'>) => ServiceQualityRecord;
  updateRecord: (id: string, updates: Partial<ServiceQualityRecord>) => void;
  deleteRecord: (id: string) => void;
  calculateSuggestedHours: (registrationId: string) => number | null;
  hasAbsentRecord: (registrationId: string) => boolean;
  getUserQualityStats: (userId: string) => {
    totalRecords: number;
    lateCount: number;
    earlyLeaveCount: number;
    absentCount: number;
    normalCount: number;
    averageRating: number | null;
    ratingCounts: Record<ServiceEvaluationRating, number>;
  };
}

export const useServiceQualityStore = create<ServiceQualityStore>((set, get) => ({
  records: [],

  loadRecords: () => {
    const stored = getStorageItem<ServiceQualityRecord[]>('service_quality', []);
    if (stored.length === 0) {
      set({ records: mockServiceQualityRecords });
      setStorageItem('service_quality', mockServiceQualityRecords);
    } else {
      set({ records: stored });
    }
  },

  getRecordsByUserId: (userId) => {
    return get().records.filter(r => r.userId === userId);
  },

  getRecordsByActivityId: (activityId) => {
    return get().records.filter(r => r.activityId === activityId);
  },

  getRecordsByPositionId: (positionId) => {
    return get().records.filter(r => r.positionId === positionId);
  },

  getRecordsByRegistrationId: (registrationId) => {
    return get().records.filter(r => r.registrationId === registrationId);
  },

  getRecordsByTimeSlotId: (timeSlotId) => {
    return get().records.filter(r => r.timeSlotId === timeSlotId);
  },

  addRecord: (data) => {
    const newRecord: ServiceQualityRecord = {
      ...data,
      id: generateId(),
      recordedAt: new Date().toISOString()
    };
    const newRecords = [...get().records, newRecord];
    set({ records: newRecords });
    setStorageItem('service_quality', newRecords);
    return newRecord;
  },

  updateRecord: (id, updates) => {
    const newRecords = get().records.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    set({ records: newRecords });
    setStorageItem('service_quality', newRecords);
  },

  deleteRecord: (id) => {
    const newRecords = get().records.filter(r => r.id !== id);
    set({ records: newRecords });
    setStorageItem('service_quality', newRecords);
  },

  hasAbsentRecord: (registrationId) => {
    return get().records.some(
      r => r.registrationId === registrationId && r.qualityType === 'absent'
    );
  },

  calculateSuggestedHours: (registrationId) => {
    const records = get().getRecordsByRegistrationId(registrationId);
    if (records.length === 0) return null;

    if (records.some(r => r.qualityType === 'absent')) {
      return 0;
    }

    const { getTimeSlotsByIds, getTimeSlotsByPositionId } = useActivityStore.getState();
    
    let totalSlotHours = 0;
    let totalDeduction = 0;

    const slotIds = records.map(r => r.timeSlotId).filter(Boolean) as string[];
    let timeSlots: TimeSlot[] = [];

    if (slotIds.length > 0) {
      timeSlots = getTimeSlotsByIds(slotIds);
    } else {
      const firstRecord = records[0];
      if (firstRecord) {
        timeSlots = getTimeSlotsByPositionId(firstRecord.positionId);
      }
    }

    timeSlots.forEach(slot => {
      totalSlotHours += calculateHours(slot.startTime, slot.endTime);
    });

    records.forEach(record => {
      if (record.qualityType === 'late' && record.lateMinutes) {
        totalDeduction += record.lateMinutes / 60;
      }
      if (record.qualityType === 'early_leave' && record.earlyLeaveMinutes) {
        totalDeduction += record.earlyLeaveMinutes / 60;
      }
    });

    const suggested = Math.max(0, Math.round((totalSlotHours - totalDeduction) * 100) / 100);
    return suggested;
  },

  getUserQualityStats: (userId) => {
    const userRecords = get().getRecordsByUserId(userId);
    
    const stats = {
      totalRecords: userRecords.length,
      lateCount: 0,
      earlyLeaveCount: 0,
      absentCount: 0,
      normalCount: 0,
      averageRating: null as number | null,
      ratingCounts: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
      } as Record<ServiceEvaluationRating, number>
    };

    let totalRatingValue = 0;
    let ratedCount = 0;

    const ratingValues: Record<ServiceEvaluationRating, number> = {
      excellent: 5,
      good: 4,
      average: 3,
      poor: 2
    };

    userRecords.forEach(record => {
      switch (record.qualityType) {
        case 'late':
          stats.lateCount++;
          break;
        case 'early_leave':
          stats.earlyLeaveCount++;
          break;
        case 'absent':
          stats.absentCount++;
          break;
        case 'normal':
          stats.normalCount++;
          break;
      }

      if (record.rating) {
        stats.ratingCounts[record.rating]++;
        totalRatingValue += ratingValues[record.rating];
        ratedCount++;
      }
    });

    if (ratedCount > 0) {
      stats.averageRating = Math.round((totalRatingValue / ratedCount) * 100) / 100;
    }

    return stats;
  }
}));
