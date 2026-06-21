import { create } from 'zustand';
import { Certificate, CertificateStatus } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { mockCertificates } from '../data/mockData';
import { generateId, generateCertificateNo } from '../utils/idGenerator';

interface CertificateStore {
  certificates: Certificate[];
  loadCertificates: () => void;
  getCertificatesByUserId: (userId: string) => Certificate[];
  getCertificateById: (id: string) => Certificate | undefined;
  getCertificateByWorkHourId: (workHourId: string) => Certificate | undefined;
  generateCertificate: (workHourId: string, userId: string, activityId: string, hours: number, issuerId: string) => Certificate;
  revokeCertificate: (id: string) => void;
  getNextCertificateNo: () => string;
}

export const useCertificateStore = create<CertificateStore>((set, get) => ({
  certificates: [],

  loadCertificates: () => {
    const stored = getStorageItem<Certificate[]>('certificates', []);
    if (stored.length === 0) {
      set({ certificates: mockCertificates });
      setStorageItem('certificates', mockCertificates);
    } else {
      set({ certificates: stored });
    }
  },

  getCertificatesByUserId: (userId) => {
    return get().certificates.filter(c => c.userId === userId);
  },

  getCertificateById: (id) => {
    return get().certificates.find(c => c.id === id);
  },

  getCertificateByWorkHourId: (workHourId) => {
    return get().certificates.find(c => c.workHourId === workHourId);
  },

  generateCertificate: (workHourId, userId, activityId, hours, issuerId) => {
    const existing = get().getCertificateByWorkHourId(workHourId);
    if (existing && existing.status === 'valid') return existing;

    const certificateNo = get().getNextCertificateNo();

    const newCertificate: Certificate = {
      id: generateId(),
      certificateNo,
      userId,
      workHourId,
      activityId,
      hours,
      issueDate: new Date().toISOString(),
      status: 'valid',
      issuerId
    };

    const newCertificates = [...get().certificates, newCertificate];
    set({ certificates: newCertificates });
    setStorageItem('certificates', newCertificates);
    return newCertificate;
  },

  revokeCertificate: (id) => {
    const newCertificates = get().certificates.map(c =>
      c.id === id ? { ...c, status: 'revoked' as CertificateStatus } : c
    );
    set({ certificates: newCertificates });
    setStorageItem('certificates', newCertificates);
  },

  getNextCertificateNo: () => {
    const currentYear = new Date().getFullYear();
    const yearCerts = get().certificates.filter(c => {
      const certYear = new Date(c.issueDate).getFullYear();
      return certYear === currentYear;
    });
    const nextSeq = yearCerts.length + 1;
    return generateCertificateNo(currentYear, nextSeq);
  }
}));
