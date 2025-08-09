export const PERMIT_FORM_ERRORS = {
  // Updated to match Java DTO validation messages and field names
  invalidPermitName:
    'Permit name is required, must be at most 100 characters, and can only contain letters, numbers, spaces, dashes, apostrophes, and periods',
  invalidApplicantName:
    'Applicant name is required, must be at most 100 characters, and can only contain letters, numbers, spaces, dashes, apostrophes, and periods',
  invalidPermitType:
    'Permit type is required, must be at most 50 characters, and can only contain letters, numbers, spaces, dashes, apostrophes, and periods',
  invalidStatus: 'Status is required and must be a valid permit status',
};

export const PERMIT_FORM_HEADERS = {
  newPermit: 'New Permit',
  updatePermit: 'Update Permit',
};

export const PERMIT_FORM_CONSTRAINTS = {
  // Updated to match Java DTO constraints
  permitNameMaxLength: 100,
  applicantNameMaxLength: 100,
  permitTypeMaxLength: 50,
  // Pattern for text fields from Java: ^[a-zA-Z0-9 \-.']+$
  textFieldPattern: /^[a-zA-Z0-9 \-.']+$/,
};

/**
 * Validation patterns matching the Java DTO constraints
 */
export const PERMIT_FORM_PATTERNS = {
  PERMIT_NAME: /^[a-zA-Z0-9 \-.']+$/,
  APPLICANT_NAME: /^[a-zA-Z0-9 \-.']+$/,
  PERMIT_TYPE: /^[a-zA-Z0-9 \-.']+$/,
};

/**
 * Maximum length constraints from Java DTO
 */
export const PERMIT_FORM_MAX_LENGTHS = {
  PERMIT_NAME: 100,
  APPLICANT_NAME: 100,
  PERMIT_TYPE: 50,
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
