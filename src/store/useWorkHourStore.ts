import { create } from 'zustand';
import { WorkHour, WorkHourStatus } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockWorkHours } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { useCertificateStore } from './useCertificateStore';
import { useServiceQualityStore } from './useServiceQualityStore';

interface WorkHourStore {
  workHours: WorkHour[];
  loadWorkHours: () => void;
  getWorkHoursByUserId: (userId: string) => WorkHour[];
  getWorkHoursByActivityId: (activityId: string) => WorkHour[];
  getWorkHourById: (id: string) => WorkHour | undefined;
  getWorkHourByRegistrationId: (registrationId: string) => WorkHour | undefined;
  getPendingWorkHours: () => WorkHour[];
  addWorkHour: (data: Omit<WorkHour, 'id' | 'status' | 'submittedAt' | 'reviewedAt' | 'reviewerId' | 'rejectReason' | 'suggestedHours'>) => WorkHour;
  submitWorkHour: (id: string) => { success: boolean; reason?: string };
  resubmitWorkHour: (id: string) => void;
  approveWorkHour: (id: string, reviewerId: string) => { success: boolean; reason?: string };
  rejectWorkHour: (id: string, reviewerId: string, reason: string) => void;
  updateWorkHour: (id: string, updates: Partial<WorkHour>) => void;
  getTotalApprovedHours: (userId: string) => number;
  canSubmitWorkHour: (registrationId: string) => { canSubmit: boolean; reason?: string };
  refreshSuggestedHours: (registrationId: string) => void;
}

export const useWorkHourStore = create<WorkHourStore>((set, get) => ({
  workHours: [],

  loadWorkHours: () => {
    const stored = getStorageItem<WorkHour[]>('workhours', []);
    if (stored.length === 0) {
      set({ workHours: mockWorkHours });
      setStorageItem('workhours', mockWorkHours);
    } else {
      const hasWh003 = stored.some(w => w.id === 'wh-003');
      const hasWh004 = stored.some(w => w.id === 'wh-004');
      const merged = stored.map(w => ({
        ...w,
        suggestedHours: w.suggestedHours ?? null
      }));
      if (!hasWh003) {
        const wh003 = mockWorkHours.find(w => w.id === 'wh-003');
        if (wh003) merged.push(wh003);
      }
      if (!hasWh004) {
        const wh004 = mockWorkHours.find(w => w.id === 'wh-004');
        if (wh004) merged.push(wh004);
      }
      if (merged.length !== stored.length || merged.some((w, i) => w.suggestedHours !== stored[i]?.suggestedHours)) {
        set({ workHours: merged });
        setStorageItem('workhours', merged);
      } else {
        set({ workHours: stored });
      }
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

  canSubmitWorkHour: (registrationId) => {
    const { hasAbsentRecord, calculateSuggestedHours } = useServiceQualityStore.getState();

    if (hasAbsentRecord(registrationId)) {
      return { canSubmit: false, reason: '存在缺勤记录，不允许提交工时，请联系负责人' };
    }

    return { canSubmit: true };
  },

  refreshSuggestedHours: (registrationId) => {
    const { calculateSuggestedHours } = useServiceQualityStore.getState();
    const suggested = calculateSuggestedHours(registrationId);
    const workHour = get().getWorkHourByRegistrationId(registrationId);
    if (workHour) {
      get().updateWorkHour(workHour.id, { suggestedHours: suggested });
    }
  },

  addWorkHour: (data) => {
    const existing = get().getWorkHourByRegistrationId(data.registrationId);
    if (existing) return existing;

    const { calculateSuggestedHours } = useServiceQualityStore.getState();
    const suggestedHours = calculateSuggestedHours(data.registrationId);

    const newWorkHour: WorkHour = {
      ...data,
      id: generateId(),
      status: 'draft',
      reviewerId: null,
      rejectReason: null,
      submittedAt: null,
      reviewedAt: null,
      suggestedHours
    };

    const newWorkHours = [...get().workHours, newWorkHour];
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
    return newWorkHour;
  },

  submitWorkHour: (id) => {
    const workHour = get().getWorkHourById(id);
    if (!workHour) return { success: false, reason: '工时记录不存在' };

    const { hasAbsentRecord, calculateSuggestedHours } = useServiceQualityStore.getState();

    if (hasAbsentRecord(workHour.registrationId)) {
      return { success: false, reason: '存在缺勤记录，不允许提交工时，请联系负责人' };
    }

    const suggestedHours = calculateSuggestedHours(workHour.registrationId);

    const newWorkHours = get().workHours.map(w =>
      w.id === id ? {
        ...w,
        status: 'pending' as WorkHourStatus,
        submittedAt: new Date().toISOString(),
        suggestedHours
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
    return { success: true };
  },

  resubmitWorkHour: (id) => {
    const workHour = get().getWorkHourById(id);
    if (!workHour) return;

    const { calculateSuggestedHours } = useServiceQualityStore.getState();
    const suggestedHours = calculateSuggestedHours(workHour.registrationId);

    const newWorkHours = get().workHours.map(w =>
      w.id === id ? {
        ...w,
        status: 'pending' as WorkHourStatus,
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerId: null,
        rejectReason: null,
        suggestedHours
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);
  },

  approveWorkHour: (id, reviewerId) => {
    const workHour = get().getWorkHourById(id);
    if (!workHour) return { success: false, reason: '工时记录不存在' };

    const { hasAbsentRecord, calculateSuggestedHours } = useServiceQualityStore.getState();

    if (hasAbsentRecord(workHour.registrationId)) {
      return { success: false, reason: '存在缺勤记录，不允许通过审核' };
    }

    const suggestedHours = calculateSuggestedHours(workHour.registrationId);

    const newWorkHours = get().workHours.map(w =>
      w.id === id ? {
        ...w,
        status: 'approved' as WorkHourStatus,
        reviewerId,
        reviewedAt: new Date().toISOString(),
        suggestedHours
      } : w
    );
    set({ workHours: newWorkHours });
    setStorageItem('workhours', newWorkHours);

    useCertificateStore.getState().generateCertificate(
      workHour.id,
      workHour.userId,
      workHour.activityId,
      workHour.hours,
      reviewerId
    );

    return { success: true };
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

    const existingCert = useCertificateStore.getState().getCertificateByWorkHourId(id);
    if (existingCert && existingCert.status === 'valid') {
      useCertificateStore.getState().revokeCertificate(existingCert.id);
    }
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
