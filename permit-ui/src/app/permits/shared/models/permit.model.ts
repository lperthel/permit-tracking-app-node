import { PermitStatus } from './permit-status.enums';

export interface Permit {
  id: string;
  permitName: string;
  applicantName: string;
  permitType: string;
  status: PermitStatus; // Changed from string to enum
}
