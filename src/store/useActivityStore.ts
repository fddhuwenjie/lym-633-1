import { create } from 'zustand';
import { Activity, Position, ActivityStatus, TimeSlot } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockActivities, mockPositions, mockTimeSlots } from '../data/mockData';
import { generateId } from '../utils/idGenerator';

interface ActivityStore {
  activities: Activity[];
  positions: Position[];
  timeSlots: TimeSlot[];
  loadActivities: () => void;
  getActivityById: (id: string) => Activity | undefined;
  getPositionsByActivityId: (activityId: string) => Position[];
  getPositionById: (positionId: string) => Position | undefined;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  updateActivityStatus: (id: string, status: ActivityStatus) => void;
  addPosition: (position: Omit<Position, 'id'>) => Position;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  getTimeSlotsByActivityId: (activityId: string) => TimeSlot[];
  getTimeSlotsByPositionId: (positionId: string) => TimeSlot[];
  getTimeSlotById: (timeSlotId: string) => TimeSlot | undefined;
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => TimeSlot;
  updateTimeSlot: (id: string, updates: Partial<TimeSlot>) => void;
  deleteTimeSlot: (id: string) => void;
  getTimeSlotsByIds: (ids: string[]) => TimeSlot[];
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  positions: [],
  timeSlots: [],

  loadActivities: () => {
    const storedActivities = getStorageItem<Activity[]>('activities', []);
    const storedPositions = getStorageItem<Position[]>('positions', []);
    const storedTimeSlots = getStorageItem<TimeSlot[]>('timeslots', []);
    
    if (storedActivities.length === 0) {
      set({ activities: mockActivities, positions: mockPositions, timeSlots: mockTimeSlots });
      setStorageItem('activities', mockActivities);
      setStorageItem('positions', mockPositions);
      setStorageItem('timeslots', mockTimeSlots);
    } else {
      const hasSlots = storedTimeSlots.length > 0;
      set({ 
        activities: storedActivities, 
        positions: storedPositions,
        timeSlots: hasSlots ? storedTimeSlots : mockTimeSlots
      });
      if (!hasSlots) {
        setStorageItem('timeslots', mockTimeSlots);
      }
    }
  },

  getActivityById: (id: string) => {
    return get().activities.find(a => a.id === id);
  },

  getPositionsByActivityId: (activityId: string) => {
    return get().positions.filter(p => p.activityId === activityId);
  },

  getPositionById: (positionId: string) => {
    return get().positions.find(p => p.id === positionId);
  },

  addActivity: (activityData) => {
    const now = new Date().toISOString();
    const newActivity: Activity = {
      ...activityData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    const newActivities = [...get().activities, newActivity];
    set({ activities: newActivities });
    setStorageItem('activities', newActivities);
    return newActivity;
  },

  updateActivity: (id, updates) => {
    const newActivities = get().activities.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    set({ activities: newActivities });
    setStorageItem('activities', newActivities);
  },

  updateActivityStatus: (id, status) => {
    get().updateActivity(id, { status });
  },

  addPosition: (positionData) => {
    const newPosition: Position = {
      ...positionData,
      id: generateId()
    };
    const newPositions = [...get().positions, newPosition];
    set({ positions: newPositions });
    setStorageItem('positions', newPositions);
    return newPosition;
  },

  updatePosition: (id, updates) => {
    const newPositions = get().positions.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ positions: newPositions });
    setStorageItem('positions', newPositions);
  },

  deletePosition: (id) => {
    const newPositions = get().positions.filter(p => p.id !== id);
    set({ positions: newPositions });
    setStorageItem('positions', newPositions);
  },

  getTimeSlotsByActivityId: (activityId) => {
    return get().timeSlots.filter(ts => ts.activityId === activityId);
  },

  getTimeSlotsByPositionId: (positionId) => {
    return get().timeSlots.filter(ts => ts.positionId === positionId);
  },

  getTimeSlotById: (timeSlotId) => {
    return get().timeSlots.find(ts => ts.id === timeSlotId);
  },

  addTimeSlot: (timeSlotData) => {
    const newTimeSlot: TimeSlot = {
      ...timeSlotData,
      id: generateId()
    };
    const newTimeSlots = [...get().timeSlots, newTimeSlot];
    set({ timeSlots: newTimeSlots });
    setStorageItem('timeslots', newTimeSlots);
    return newTimeSlot;
  },

  updateTimeSlot: (id, updates) => {
    const newTimeSlots = get().timeSlots.map(ts =>
      ts.id === id ? { ...ts, ...updates } : ts
    );
    set({ timeSlots: newTimeSlots });
    setStorageItem('timeslots', newTimeSlots);
  },

  deleteTimeSlot: (id) => {
    const newTimeSlots = get().timeSlots.filter(ts => ts.id !== id);
    set({ timeSlots: newTimeSlots });
    setStorageItem('timeslots', newTimeSlots);
  },

  getTimeSlotsByIds: (ids) => {
    return get().timeSlots.filter(ts => ids.includes(ts.id));
  }
}));
