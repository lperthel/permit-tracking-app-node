export interface Permit {
  id: string;
  permitName: string;
  applicantName: string;
  permitType: string;
  status: string;
}

export const permitStatuses = [
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'UNDER_REVIEW',
];
