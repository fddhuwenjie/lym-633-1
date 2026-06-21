export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCertificateNo(year: number, sequence: number): string {
  const seqStr = sequence.toString().padStart(6, '0');
  return `VOL-${year}-${seqStr}`;
}
