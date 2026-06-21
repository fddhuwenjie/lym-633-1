import { create } from 'zustand';
import { CheckinRecord, CheckinStatus } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockCheckins } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { calculateHours } from '../utils/date';
import { useRegistrationStore } from './useRegistrationStore';

interface CheckinStore {
  checkins: CheckinRecord[];
  loadCheckins: () => void;
  getCheckinByRegistrationId: (registrationId: string) => CheckinRecord | undefined;
  getCheckinsByUserId: (userId: string) => CheckinRecord[];
  getCheckinsByActivityId: (activityId: string) => CheckinRecord[];
  createCheckin: (registrationId: string, userId: string) => CheckinRecord;
  checkIn: (registrationId: string) => CheckinRecord | null;
  checkOut: (registrationId: string) => CheckinRecord | null;
  calculateWorkHours: (registrationId: string) => number;
  updateCheckinStatus: (id: string, updates: Partial<CheckinRecord>) => void;
}

export const useCheckinStore = create<CheckinStore>((set, get) => ({
  checkins: [],

  loadCheckins: () => {
    const stored = getStorageItem<CheckinRecord[]>('checkins', []);
    if (stored.length === 0) {
      set({ checkins: mockCheckins });
      setStorageItem('checkins', mockCheckins);
    } else {
      set({ checkins: stored });
    }
  },

  getCheckinByRegistrationId: (registrationId) => {
    return get().checkins.find(c => c.registrationId === registrationId);
  },

  getCheckinsByUserId: (userId) => {
    return get().checkins.filter(c => c.userId === userId);
  },

  getCheckinsByActivityId: (activityId) => {
    const { registrations } = useRegistrationStore.getState();
    const activityRegIds = registrations
      .filter(r => r.activityId === activityId)
      .map(r => r.id);
    return get().checkins.filter(c => activityRegIds.includes(c.registrationId));
  },

  createCheckin: (registrationId, userId) => {
    const existing = get().getCheckinByRegistrationId(registrationId);
    if (existing) return existing;

    const newCheckin: CheckinRecord = {
      id: generateId(),
      registrationId,
      userId,
      checkinTime: null,
      checkoutTime: null,
      status: 'not_started'
    };

    const newCheckins = [...get().checkins, newCheckin];
    set({ checkins: newCheckins });
    setStorageItem('checkins', newCheckins);
    return newCheckin;
  },

  checkIn: (registrationId) => {
    const checkin = get().getCheckinByRegistrationId(registrationId);
    if (!checkin || checkin.status !== 'not_started') return null;

    const updated = {
      ...checkin,
      checkinTime: new Date().toISOString(),
      status: 'checked_in' as CheckinStatus
    };

    const newCheckins = get().checkins.map(c =>
      c.id === checkin.id ? updated : c
    );
    set({ checkins: newCheckins });
    setStorageItem('checkins', newCheckins);
    return updated;
  },

  checkOut: (registrationId) => {
    const checkin = get().getCheckinByRegistrationId(registrationId);
    if (!checkin || checkin.status !== 'checked_in' || !checkin.checkinTime) return null;

    const updated = {
      ...checkin,
      checkoutTime: new Date().toISOString(),
      status: 'checked_out' as CheckinStatus
    };

    const newCheckins = get().checkins.map(c =>
      c.id === checkin.id ? updated : c
    );
    set({ checkins: newCheckins });
    setStorageItem('checkins', newCheckins);
    return updated;
  },

  calculateWorkHours: (registrationId) => {
    const checkin = get().getCheckinByRegistrationId(registrationId);
    if (!checkin || !checkin.checkinTime || !checkin.checkoutTime) return 0;
    return calculateHours(checkin.checkinTime, checkin.checkoutTime);
  },

  updateCheckinStatus: (id, updates) => {
    const newCheckins = get().checkins.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ checkins: newCheckins });
    setStorageItem('checkins', newCheckins);
  }
}));
