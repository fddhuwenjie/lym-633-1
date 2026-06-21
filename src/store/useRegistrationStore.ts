import { create } from 'zustand';
import { Registration, RegistrationStatus, TimeSlot } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockRegistrations } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { useActivityStore } from './useActivityStore';
import { isTimeOverlap } from '../utils/date';

interface TimeSlotConflict {
  hasConflict: boolean;
  conflictingSlots: { slot: TimeSlot; activityTitle: string; positionName: string }[];
}

interface RegistrationStore {
  registrations: Registration[];
  loadRegistrations: () => void;
  getRegistrationsByUserId: (userId: string) => Registration[];
  getRegistrationsByActivityId: (activityId: string) => Registration[];
  getRegistrationsByPositionId: (positionId: string) => Registration[];
  getRegistrationById: (id: string) => Registration | undefined;
  getConfirmedCountByPosition: (positionId: string) => number;
  getWaitlistCountByPosition: (positionId: string) => number;
  addRegistration: (data: Omit<Registration, 'id' | 'signUpTime' | 'confirmedTime' | 'waitlistOrder' | 'status' | 'selectedTimeSlotIds'> & { selectedTimeSlotIds?: string[] }) => Registration;
  updateRegistrationStatus: (id: string, status: RegistrationStatus) => void;
  confirmRegistration: (id: string) => void;
  cancelRegistration: (id: string) => void;
  promoteFromWaitlist: (positionId: string) => Registration | null;
  hasUserRegistered: (userId: string, activityId: string) => boolean;
  updateSelectedTimeSlots: (registrationId: string, timeSlotIds: string[]) => void;
  checkTimeSlotConflicts: (userId: string, excludeRegistrationId?: string) => (slotIds: string[]) => TimeSlotConflict;
  getConfirmedSlotsByUserId: (userId: string) => TimeSlot[];
  getSlotConfirmedCount: (timeSlotId: string) => number;
}

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  registrations: [],

  loadRegistrations: () => {
    const stored = getStorageItem<Registration[]>('registrations', []);
    if (stored.length === 0) {
      set({ registrations: mockRegistrations });
      setStorageItem('registrations', mockRegistrations);
    } else {
      const updated = stored.map(r => ({
        ...r,
        selectedTimeSlotIds: r.selectedTimeSlotIds || []
      }));
      set({ registrations: updated });
      setStorageItem('registrations', updated);
    }
  },

  getRegistrationsByUserId: (userId) => {
    return get().registrations.filter(r => r.userId === userId);
  },

  getRegistrationsByActivityId: (activityId) => {
    return get().registrations.filter(r => r.activityId === activityId);
  },

  getRegistrationsByPositionId: (positionId) => {
    return get().registrations.filter(r => r.positionId === positionId);
  },

  getRegistrationById: (id) => {
    return get().registrations.find(r => r.id === id);
  },

  getConfirmedCountByPosition: (positionId) => {
    return get().registrations.filter(
      r => r.positionId === positionId && r.status === 'confirmed'
    ).length;
  },

  getWaitlistCountByPosition: (positionId) => {
    return get().registrations.filter(
      r => r.positionId === positionId && r.status === 'waitlist'
    ).length;
  },

  getSlotConfirmedCount: (timeSlotId) => {
    return get().registrations.filter(
      r => r.status === 'confirmed' && r.selectedTimeSlotIds.includes(timeSlotId)
    ).length;
  },

  getConfirmedSlotsByUserId: (userId) => {
    const { getTimeSlotsByIds } = useActivityStore.getState();
    const userRegs = get().registrations.filter(
      r => r.userId === userId && r.status === 'confirmed'
    );
    const allSlotIds = userRegs.flatMap(r => r.selectedTimeSlotIds);
    return getTimeSlotsByIds(allSlotIds);
  },

  checkTimeSlotConflicts: (userId, excludeRegistrationId) => (slotIds) => {
    const { getTimeSlotById, getActivityById, getPositionById } = useActivityStore.getState();
    const confirmedSlots = get().getConfirmedSlotsByUserId(userId).filter(
      s => {
        if (!excludeRegistrationId) return true;
        const reg = get().registrations.find(
          r => r.userId === userId && r.status === 'confirmed' && r.selectedTimeSlotIds.includes(s.id)
        );
        return reg?.id !== excludeRegistrationId;
      }
    );
    
    const conflictingSlots: { slot: TimeSlot; activityTitle: string; positionName: string }[] = [];
    const newSlots = slotIds.map(id => getTimeSlotById(id)).filter(Boolean) as TimeSlot[];

    newSlots.forEach(newSlot => {
      confirmedSlots.forEach(existingSlot => {
        if (isTimeOverlap(newSlot.startTime, newSlot.endTime, existingSlot.startTime, existingSlot.endTime)) {
          const activity = getActivityById(existingSlot.activityId);
          const position = getPositionById(existingSlot.positionId);
          if (!conflictingSlots.find(c => c.slot.id === existingSlot.id)) {
            conflictingSlots.push({
              slot: existingSlot,
              activityTitle: activity?.title || '未知活动',
              positionName: position?.name || '未知岗位'
            });
          }
        }
      });
    });

    return {
      hasConflict: conflictingSlots.length > 0,
      conflictingSlots
    };
  },

  addRegistration: (data) => {
    const { positions } = useActivityStore.getState();
    const position = positions.find(p => p.id === data.positionId);
    const confirmedCount = get().getConfirmedCountByPosition(data.positionId);
    
    const isFull = position ? confirmedCount >= position.totalQuota : false;
    
    const status: RegistrationStatus = isFull ? 'waitlist' : 'pending';
    let waitlistOrder: number | null = null;
    
    if (isFull) {
      const waitlistCount = get().getWaitlistCountByPosition(data.positionId);
      waitlistOrder = waitlistCount + 1;
    }

    const newRegistration: Registration = {
      ...data,
      id: generateId(),
      status,
      waitlistOrder,
      signUpTime: new Date().toISOString(),
      confirmedTime: null,
      selectedTimeSlotIds: data.selectedTimeSlotIds || []
    };

    const newRegistrations = [...get().registrations, newRegistration];
    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
    return newRegistration;
  },

  updateRegistrationStatus: (id, status) => {
    const newRegistrations = get().registrations.map(r =>
      r.id === id ? { ...r, status } : r
    );
    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
  },

  updateSelectedTimeSlots: (registrationId, timeSlotIds) => {
    const newRegistrations = get().registrations.map(r =>
      r.id === registrationId ? { ...r, selectedTimeSlotIds: timeSlotIds } : r
    );
    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
  },

  confirmRegistration: (id) => {
    const newRegistrations = get().registrations.map(r =>
      r.id === id ? { 
        ...r, 
        status: 'confirmed' as RegistrationStatus, 
        confirmedTime: new Date().toISOString(),
        waitlistOrder: null
      } : r
    );
    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
  },

  cancelRegistration: (id) => {
    const registration = get().getRegistrationById(id);
    if (!registration) return;

    let newRegistrations = get().registrations.map(r =>
      r.id === id ? { ...r, status: 'cancelled' as RegistrationStatus, waitlistOrder: null, selectedTimeSlotIds: [] } : r
    );

    if (registration.status === 'confirmed') {
      const waitlistRegs = newRegistrations
        .filter(r => r.positionId === registration.positionId && r.status === 'waitlist')
        .sort((a, b) => (a.waitlistOrder || 0) - (b.waitlistOrder || 0));
      
      if (waitlistRegs.length > 0) {
        const firstWaitlist = waitlistRegs[0];
        newRegistrations = newRegistrations.map(r => {
          if (r.id === firstWaitlist.id) {
            return {
              ...r,
              status: 'pending' as RegistrationStatus,
              waitlistOrder: null,
              confirmedTime: new Date().toISOString()
            };
          }
          if (r.positionId === registration.positionId && r.status === 'waitlist' && r.waitlistOrder) {
            return { ...r, waitlistOrder: r.waitlistOrder - 1 };
          }
          return r;
        });
      }
    } else if (registration.status === 'waitlist') {
      newRegistrations = newRegistrations.map(r => {
        if (r.positionId === registration.positionId && r.status === 'waitlist' && r.waitlistOrder && registration.waitlistOrder && r.waitlistOrder > registration.waitlistOrder) {
          return { ...r, waitlistOrder: r.waitlistOrder - 1 };
        }
        return r;
      });
    }

    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
  },

  promoteFromWaitlist: (positionId) => {
    const waitlistRegs = get().registrations
      .filter(r => r.positionId === positionId && r.status === 'waitlist')
      .sort((a, b) => (a.waitlistOrder || 0) - (b.waitlistOrder || 0));
    
    if (waitlistRegs.length === 0) return null;

    const firstWaitlist = waitlistRegs[0];
    const updated = {
      ...firstWaitlist,
      status: 'confirmed' as RegistrationStatus,
      waitlistOrder: null,
      confirmedTime: new Date().toISOString()
    };

    const newRegistrations = get().registrations.map(r => {
      if (r.id === firstWaitlist.id) return updated;
      if (r.positionId === positionId && r.status === 'waitlist' && r.waitlistOrder && firstWaitlist.waitlistOrder && r.waitlistOrder > firstWaitlist.waitlistOrder) {
        return { ...r, waitlistOrder: r.waitlistOrder - 1 };
      }
      return r;
    });

    set({ registrations: newRegistrations });
    setStorageItem('registrations', newRegistrations);
    return updated;
  },

  hasUserRegistered: (userId, activityId) => {
    return get().registrations.some(
      r => r.userId === userId && r.activityId === activityId && r.status !== 'cancelled' && r.status !== 'rejected'
    );
  }
}));
