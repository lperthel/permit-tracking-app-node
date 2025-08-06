import { v4 as uuidv4 } from 'uuid';
import { Permit } from '../../permits/shared/models/permit.model';

export const createThisPermit: Permit = {
  id: uuidv4(),
  permitName: 'Create New Substation',
  applicantName: 'Create a new substation by North Bethesda Metro',
  permitType: 'Electrical',
  status: 'SUBMITTED',
};

export const updatePermit: Permit = {
  id: uuidv4(),
  permitName: 'Create New Substation',
  applicantName: 'Create a new substation by Rockville - Updated',
  permitType: 'Electrical',
  status: 'UNDER_REVIEW',
};

export const deleteThisPermit: Permit = {
  id: uuidv4(),
  permitName: 'Delete This Permit',
  applicantName: 'Delete Me',
  permitType: 'Electrical',
  status: 'REJECTED',
};
