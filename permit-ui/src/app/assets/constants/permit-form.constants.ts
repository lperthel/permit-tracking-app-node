/**
 * Test selectors and constants for Permit Form component
 * Centralized location for all data-testid values to maintain consistency
 * between source code and Cypress tests
 */

export const PERMIT_FORM_SELECTORS = {
  // Modal elements
  MODAL_HEADER: 'modal-header',
  MODAL_TITLE: 'modal-title',
  MODAL_CLOSE_BUTTON: 'modal-close-button',
  MODAL_BODY: 'modal-body',
  MODAL_FOOTER: 'modal-footer',

  // Form elements
  PERMIT_FORM: 'permit-form',
  FORM_GROUP: 'form-group',
  SUBMIT_BUTTON: 'submit-button',

  // Error display
  REST_ERROR: 'rest-error',

  // Input fields
  INPUT_PERMIT_NAME: 'input-permit-name',
  INPUT_APPLICANT_NAME: 'input-applicant-name',
  INPUT_PERMIT_TYPE: 'input-permit-type',
  INPUT_STATUS: 'input-status',

  // Field error messages
  ERROR_PERMIT_NAME: 'error-permit-name',
  ERROR_APPLICANT_NAME: 'error-applicant-name',
  ERROR_PERMIT_TYPE: 'error-permit-type',
  ERROR_STATUS: 'error-status',
} as const;

/**
 * Permit form field mappings from old Product model
 * Product => Permit mapping:
 * - name:string => permitName:string
 * - desc:string => applicantName:string
 * - price:num => permitType:string
 * - quantity:num => status:string
 */
export const PERMIT_FORM_FIELDS = {
  PERMIT_NAME: 'permitName', // was 'name' in product
  APPLICANT_NAME: 'applicantName', // was 'desc' in product
  PERMIT_TYPE: 'permitType', // was 'price' in product
  STATUS: 'status', // was 'quantity' in product
} as const;
