import { create } from 'zustand';
import { User } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockUsers } from '../data/mockData';

interface UserStore {
  users: User[];
  currentUserId: string | null;
  loadUsers: () => void;
  setCurrentUser: (userId: string | null) => void;
  getCurrentUser: () => User | null;
  getUserById: (userId: string) => User | undefined;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUserId: null,

  loadUsers: () => {
    const storedUsers = getStorageItem<User[]>('users', []);
    const storedCurrentUser = getStorageItem<string | null>('current_user', null);
    
    if (storedUsers.length === 0) {
      set({ users: mockUsers, currentUserId: storedCurrentUser || mockUsers[2].id });
      setStorageItem('users', mockUsers);
      if (!storedCurrentUser) {
        setStorageItem('current_user', mockUsers[2].id);
      }
    } else {
      set({ users: storedUsers, currentUserId: storedCurrentUser });
    }
  },

  setCurrentUser: (userId: string | null) => {
    set({ currentUserId: userId });
    setStorageItem('current_user', userId);
  },

  getCurrentUser: () => {
    const { users, currentUserId } = get();
    return users.find(u => u.id === currentUserId) || null;
  },

  getUserById: (userId: string) => {
    return get().users.find(u => u.id === userId);
  },

  addUser: (user: User) => {
    const newUsers = [...get().users, user];
    set({ users: newUsers });
    setStorageItem('users', newUsers);
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    const newUsers = get().users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    set({ users: newUsers });
    setStorageItem('users', newUsers);
  }
}));
