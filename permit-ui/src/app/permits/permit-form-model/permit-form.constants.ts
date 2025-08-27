/**
 * Test selectors and constants for Permit Form component
 * Centralized location for all data-testid values to maintain consistency
 * between source code and Cypress tests
 */

export const PERMIT_FORM_SELECTORS = {
  // Modal elements - more descriptive names
  MODAL_HEADER: 'permit-form-modal-header',
  MODAL_TITLE: 'permit-form-modal-title',
  MODAL_CLOSE_BUTTON: 'permit-form-modal-close-button',
  MODAL_BODY: 'permit-form-modal-body',
  MODAL_FOOTER: 'permit-form-modal-footer',

  // Form elements - descriptive for main containers
  PERMIT_FORM: 'permit-form-container',
  FORM_GROUP: 'permit-form-group',
  SUBMIT_BUTTON: 'permit-form-submit-button',

  // Error display
  REST_ERROR: 'permit-form-rest-error',

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
export const PERMIT_FORM_ERRORS = {
  // Updated to match Java DTO validation messages and field names
  invalidPermitName:
    'Permit name is required, must be at most 100 characters, and can only contain letters, numbers, spaces, dashes, apostrophes, commas, and periods',
  invalidApplicantName:
    'Applicant name is required, must be at most 100 characters, and can only contain letters, numbers, spaces, dashes, apostrophes,commas, and periods',
  invalidPermitType:
    'Permit type is required, must be at most 50 characters, and can only contain letters, numbers, spaces, dashes, apostrophes, commas, and periods',
  invalidStatus: 'Status is required and must be a valid permit status',
};
export const PERMIT_FORM_HEADERS = {
  newPermit: 'New Permit',
  updatePermit: 'Update Permit',
};
export const PERMIT_FORM_CONSTRAINTS = {
  permitNameMaxLength: 100,
  applicantNameMaxLength: 100,
  permitTypeMaxLength: 50,
  // Pattern for text fields from Java: ^[a-zA-Z0-9 \-.']+$
  textFieldPattern: /^[a-zA-Z0-9 \-.']+$/,
};

export const PERMIT_FORM_PATTERNS = {
  VALID_CHARS: /^[a-zA-Z0-9À-ÿ \-.,&()']+$/,
};

/**
 * Required field validation messages
 */
export const PERMIT_FORM_REQUIRED_MESSAGES = {
  PERMIT_NAME: 'Permit name is required',
  APPLICANT_NAME: 'Applicant name is required',
  PERMIT_TYPE: 'Permit type is required',
  STATUS: 'Status is required',
};
/**
 * Length validation messages
 */

export const PERMIT_FORM_LENGTH_MESSAGES = {
  PERMIT_NAME: 'Permit name must be at most 100 characters',
  APPLICANT_NAME: 'Applicant name must be at most 100 characters',
  PERMIT_TYPE: 'Permit type must be at most 50 characters',
};
/**
 * Pattern validation messages
 */

export const PERMIT_FORM_PATTERN_MESSAGES = {
  PERMIT_NAME:
    'Permit name: only letters, numbers, spaces, dashes, apostrophes, and periods allowed',
  APPLICANT_NAME:
    'Applicant name: only letters, numbers, spaces, dashes, apostrophes, and periods allowed',
  PERMIT_TYPE:
    'Permit type: only letters, numbers, spaces, dashes, apostrophes, and periods allowed',
};
