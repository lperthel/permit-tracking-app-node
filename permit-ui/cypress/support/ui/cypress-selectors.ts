// ============================================================================
// cypress-selectors.ts - Centralized UI Element Selectors
// ============================================================================

/**
 * Centralized Cypress Selector Management
 *
 * PURPOSE:
 * - Single source of truth for all UI element selectors
 * - Imports selectors directly from Angular source constants
 *
 * USAGE PATTERN:
 * - Use selectors.table instead of hardcoded '[data-testid="permits-table"]'
 * - When Angular constants change, this file auto-reflects changes
 *
 */

// Import selectors from Angular source - single source of truth
import { PAGINATION } from '../../../src/app/assets/constants/pagination.constants';
import { AllPermitsComponentConstants } from '../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../../src/app/permits/permit-form-model/permit-form.constants';

/**
 * Helper function to get selector with data-testid prefix
 *
 * @param selector - The testid value from Angular constants
 * @returns Fully qualified CSS selector string
 *
 * @example
 * getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)
 * // Returns: '[data-testid="modal-title"]'
 */
export const getTestSelector = (selector: string): string => {
  return `[data-testid="${selector}"]`;
};

/**
 * Centralized Selector Object
 *
 * ORGANIZATION:
 * - Groups selectors by functional area (forms, tables, pagination)
 * - Uses factory functions for dynamic selectors (row-specific elements)
 * - Maintains flat structure for easy IDE autocomplete
 *
 * MAINTENANCE NOTES:
 * - When adding new selectors, update both Angular constants AND this file
 * - Factory functions (like permitRowName) take indices for dynamic content
 * - All selectors use data-testid approach for test stability
 */
export const selector_shortcuts = {
  // ============================================================================
  // GENERAL UI ACTIONS - Page-level interactions
  // ============================================================================

  /** Button to create new permit - triggers modal or navigation */
  createButton: getTestSelector(
    AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
  ),

  /** Button to refresh permits from database - for testing data sync */
  refreshPermitsFromDbButton: getTestSelector(
    AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
  ),

  // ============================================================================
  // PERMIT FORM SELECTORS - Form inputs and validation
  // ============================================================================

  permitForm: {
    // Form input fields
    inputPermitName: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_NAME),
    inputApplicant: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_APPLICANT_NAME),
    inputPermitType: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_TYPE),
    inputStatus: getTestSelector(PERMIT_FORM_SELECTORS.INPUT_STATUS),

    // Form validation error messages
    errorPermitName: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_PERMIT_NAME),
    errorApplicantName: getTestSelector(
      PERMIT_FORM_SELECTORS.ERROR_APPLICANT_NAME
    ),
    errorPermitType: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_PERMIT_TYPE),
    errorPermitStatus: getTestSelector(PERMIT_FORM_SELECTORS.ERROR_STATUS),
  },

  // ============================================================================
  // DATA TABLE SELECTORS - Permit listing and row operations
  // ============================================================================

  /** Main permits table container */
  table: getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE),

  // DYNAMIC ROW SELECTORS
  // These functions generate selectors for specific table rows by index
  // Usage: selectors.permitRowName(0) gets first row's permit name cell

  /** Get permit name cell for specific row index */
  permitRowName: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(index)
    ),

  /** Get applicant name cell for specific row index */
  permitRowApplicantName: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.APPLICANT_NAME_CELL(index)
    ),

  /** Get permit type cell for specific row index */
  permitRowPermitType: (index: number) =>
    getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.PERMIT_TYPE_CELL(index)
    ),

  /** Get status cell for specific row index */
  permitRowStatus: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.STATUS_CELL(index)),

  /** Get delete button cell for specific row index */
  permitRowDelete: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.DELETE_CELL(index)),

  /** Get update button cell for specific row index */
  permitRowUpdate: (index: number) =>
    getTestSelector(AllPermitsComponentConstants.TEST_IDS.UPDATE_CELL(index)),

  // ============================================================================
  // TABLE HEADERS - For sorting and accessibility testing
  // ============================================================================

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

  // ============================================================================
  // PAGINATION CONTROLS - Navigation between pages
  // ============================================================================

  pagination: {
    next: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.NEXT),
    prev: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.PREV),
    first: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.FIRST),
    last: getTestSelector(PAGINATION.PAGINATION_TEST_IDS.LAST),
  },
};

/**
 * USAGE EXAMPLES:
 *
 * // Static selector usage
 * cy.get(selectors.createButton).click();
 * cy.get(selectors.permitForm.inputPermitName).type('Test Permit');
 *
 * // Dynamic selector usage for table rows
 * cy.get(selectors.permitRowName(0)).should('contain', 'Expected Name');
 * cy.get(selectors.permitRowDelete(1)).click();
 *
 * // Header interaction
 * cy.get(selectors.headers.permitName).click(); // Sort by permit name
 *
 * // Pagination
 * cy.get(selectors.pagination.next).click();
 *
 * MAINTENANCE NOTES:
 * - When Angular constants change, this file automatically reflects changes
 * - Row index functions start at 0 (first row = index 0)
 * - All selectors use data-testid for test stability and accessibility
 * - Factory functions enable testing dynamic content without brittle selectors
 */
