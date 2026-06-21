import { create } from 'zustand';
import { WorkHour, WorkHourStatus } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockWorkHours } from '../data/mockData';
import { generateId } from '../utils/idGenerator';

interface WorkHourStore {
  workHours: WorkHour[];
  loadWorkHours: () => void;
  getWorkHoursByUserId: (userId: string) => WorkHour[];
  getWorkHoursByActivityId: (activityId: string) => WorkHour[];
  getWorkHourById: (id: string) => WorkHour | undefined;
  getWorkHourByRegistrationId: (registrationId: string) => WorkHour | undefined;
  getPendingWorkHours: () => WorkHour[];
  addWorkHour: (data: Omit<WorkHour, 'id' | 'status' | 'submittedAt' | 'reviewedAt' | 'reviewerId' | 'rejectReason'>) => WorkHour;
  submitWorkHour: (id: string) => void;
  approveWorkHour: (id: string, reviewerId: string) => void;
  rejectWorkHour: (id: string, reviewerId: string, reason: string) => void;
  updateWorkHour: (id: string, updates: Partial<WorkHour>) => void;
  getTotalApprovedHours: (userId: string) => number;
}

export const useWorkHourStore = create<WorkHourStore>((set, get) => ({
  workHours: [],

  loadWorkHours: () => {
    const stored = getStorageItem<WorkHour[]>('workhours', []);
    if (stored.length === 0) {
      set({ workHours: mockWorkHours });
      setStorageItem('workhours', mockWorkHours);
    } else {
      set({ workHours: stored });
    }
  },

  getWorkHoursByUserId: (userId) => {
    return get().workHours.filter(w => w.userId === userId);
  },

  getWorkHoursByActivityId: (activityId) => {
    return get().workHours.filter(w => w.activityId === activityId);
  },

  getWorkHourById: (id) => {
    return get().workHours.find(w => w.id === id);
  },

  getWorkHourByRegistrationId: (registrationId) => {
    return get().workHours.find(w => w.registrationId === registrationId);
  },

  getPendingWorkHours: () => {
    return get().workHours.filter(w => w.status === 'pending');
  },

  addWorkHour: (data) => {
    const existing = get().getWorkHourByRegistrationId(data.registrationId);
    if (existing) return existing;

    const newWorkHour: WorkHour = {
      ...data,
      id: generateId(),
      status: 'draft',
      reviewerId: null,
      rejectReason: null,
      submittedAt: null,
      reviewedAt: null
    };

    const newWorkHours = [...get().workHours, newWorkHour];
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
    return newWorkHour;
  },

  submitWorkHour: (id) => {
    const newWorkHours = get().workHours.map(w =>
      w.id === id ? { 
        ...w, 
        status: 'pending' as WorkHourStatus,
        submittedAt: new Date().toISOString()
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
  },

  approveWorkHour: (id, reviewerId) => {
    const newWorkHours = get().workHours.map(w =>
      w.id === id ? {
        ...w,
        status: 'approved' as WorkHourStatus,
        reviewerId,
        reviewedAt: new Date().toISOString()
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
  },

  rejectWorkHour: (id, reviewerId, reason) => {
    const newWorkHours = get().workHours.map(w =>
      w.id === id ? {
        ...w,
        status: 'rejected' as WorkHourStatus,
        reviewerId,
        rejectReason: reason,
        reviewedAt: new Date().toISOString()
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
  },

  updateWorkHour: (id, updates) => {
    const newWorkHours = get().workHours.map(w =>
      w.id === id ? { ...w, ...updates } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
  },

  getTotalApprovedHours: (userId) => {
    return get().workHours
      .filter(w => w.userId === userId && w.status === 'approved')
      .reduce((sum, w) => sum + w.hours, 0);
  }
}));
