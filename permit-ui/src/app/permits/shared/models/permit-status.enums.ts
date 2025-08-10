export enum PermitStatus {
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// Helper to get all status values as an array
export const PERMIT_STATUS_VALUES = Object.values(PermitStatus);

// Helper to get display-friendly labels
export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  [PermitStatus.SUBMITTED]: 'Submitted',
  [PermitStatus.PENDING]: 'Pending Review',
  [PermitStatus.UNDER_REVIEW]: 'Under Review',
  [PermitStatus.APPROVED]: 'Approved',
  [PermitStatus.REJECTED]: 'Rejected',
  [PermitStatus.EXPIRED]: 'Expired',
};
