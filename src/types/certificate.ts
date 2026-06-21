export type CertificateStatus = 'valid' | 'revoked';

export interface Certificate {
  id: string;
  certificateNo: string;
  userId: string;
  workHourId: string;
  activityId: string;
  hours: number;
  issueDate: string;
  status: CertificateStatus;
  issuerId: string;
}
