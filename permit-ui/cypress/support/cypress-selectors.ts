// Import selectors from Angular source - single source of truth

import { PAGINATION } from '../../src/app/assets/constants/pagination.constants';
import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../src/app/permits/permit-form-model/permit-form.constants';

/**
 * Helper function to get selector with data-testid prefix
 * Usage: getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)
 * Returns: '[data-testid="modal-title"]'
 */
export const getTestSelector = (selector: string): string => {
  return `[data-testid="${selector}"]`;
};

export const selectors = {
  // General UI selectors - using AllPermitsComponentConstants
  createButton: getTestSelector(
    AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
  ),
  refreshPermitsFromDbButton: getTestSelector(
    AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
  ),

  // Form selectors - using source constants (unchanged)
  permitForm: {
    inputPermitName: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_NAME),
    inputApplicant: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_APPLICANT_NAME),
    inputPermitType: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_TYPE),
    inputStatus: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_STATUS),
    errorPermitName: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_PERMIT_NAME),
    errorApplicantName: getTestSelector(
      PERMIT_FORM_SELECTORS.ERROR_APPLICANT_NAME
    ),
    errorPermitType: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_PERMIT_TYPE),
    errorPermitStatus: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_STATUS),
  },

  // Table selectors - now using AllPermitsComponentConstants as single source of truth
  table: getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE),
  permitRowName: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(index)
    ),
  permitRowApplicantName: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.APPLICANT_NAME_CELL(index)
    ),
  permitRowPermitType: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_TYPE_CELL(index)
    ),
  permitRowStatus: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.STATUS_CELL(index)),
  permitRowDelete: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.DELETE_CELL(index)),
  permitRowUpdate: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.UPDATE_CELL(index)),

  // Table headers - for completeness
  headers: {
    permitName: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_HEADER
    ),
    applicantName: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.APPLICANT_NAME_HEADER
    ),
    permitType: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_TYPE_HEADER
    ),
    status: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.STATUS_HEADER
    ),
    update: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.UPDATE_HEADER
    ),
    delete: getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.DELETE_HEADER
    ),
  },

  // Pagination selectors - using data-testid approach
  pagination: {
    next: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.NEXT),
    prev: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.PREV),
    first: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.FIRST),
    last: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.LAST),
  },
};
