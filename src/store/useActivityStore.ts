import { create } from 'zustand';
import { Activity, Position, ActivityStatus } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockActivities, mockPositions } from '../data/mockData';
import { generateId } from '../utils/idGenerator';

interface ActivityStore {
  activities: Activity[];
  positions: Position[];
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
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  positions: [],

  loadActivities: () => {
    const storedActivities = getStorageItem<Activity[]>('activities', []);
    const storedPositions = getStorageItem<Position[]>('positions', []);
    
    if (storedActivities.length === 0) {
      set({ activities: mockActivities, positions: mockPositions });
      setStorageItem('activities', mockActivities);
      setStorageItem('positions', mockPositions);
    } else {
      set({ activities: storedActivities, positions: storedPositions });
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
  }
}));
