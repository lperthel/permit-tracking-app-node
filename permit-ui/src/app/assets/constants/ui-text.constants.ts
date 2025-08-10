export const UI_TEXT = {
  // Page content
  ABOUT_HEADER: '⚙️ About This App',

  // Button text
  NEW_PERMIT_BUTTON: 'New Permit',
  REFRESH_PERMITS_BUTTON: 'Refresh Permits from DB',
  UPDATE_BUTTON: 'Update',
  DELETE_BUTTON: 'Delete',

  // UI state text
  EMPTY_ERROR: '',
  LOADING_MESSAGE: 'Loading permits...',
  NO_PERMITS_FOUND: 'No permits found.',
  CREATE_FIRST_PERMIT: 'Create Your First Permit',

  // Success messages
  PERMITS_UPDATED_SUCCESS: 'Permits successfully updated from database',

  // Error messages
  SERVER_CONNECTION_ERROR:
    'An error occurred trying to connect to the server. Please contact the server administrator.',

  // Table headers
  PERMIT_NAME_HEADER: 'Permit Name',
  APPLICANT_NAME_HEADER: 'Applicant Name',
  PERMIT_TYPE_HEADER: 'Permit Type',
  STATUS_HEADER: 'Status',
  UPDATE_HEADER: 'Update',
  DELETE_HEADER: 'Delete',
} as const;
