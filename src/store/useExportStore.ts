import { create } from 'zustand';
import { ExportHistory } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { generateId } from '../utils/idGenerator';

interface ExportStore {
  exportHistory: ExportHistory[];
  loadExportHistory: () => void;
  addExportRecord: (data: Omit<ExportHistory, 'id' | 'exportTime'>) => ExportHistory;
  getExportHistoryByUserId: (userId: string) => ExportHistory[];
}

export const useExportStore = create<ExportStore>((set, get) => ({
  exportHistory: [],

  loadExportHistory: () => {
    const stored = getStorageItem<ExportHistory[]>('export_history', []);
    set({ exportHistory: stored });
  },

  addExportRecord: (data) => {
    const newRecord: ExportHistory = {
      ...data,
      id: generateId(),
      exportTime: new Date().toISOString()
    };

    const newHistory = [...get().exportHistory, newRecord];
    set({ exportHistory: newHistory });
    setStorageItem('export_history', newHistory);
    return newRecord;
  },

  getExportHistoryByUserId: (userId) => {
    return get().exportHistory.filter(e => e.userId === userId).sort(
      (a, b) => new Date(b.exportTime).getTime() - new Date(a.exportTime).getTime()
    );
  }
}));
