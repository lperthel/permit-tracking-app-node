import { environment } from '../../../environments/environment';

export const API_CONSTANTS = {
  // API Configuration
  SERVER_URL: environment.apiUrl,
  PERMITS_PATH: '/permits/',
  CONTENT_TYPE_JSON: 'application/json',

  // HTTP Configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RATE_LIMIT_DELAY: 1000,
} as const;

export const LOGGING_CONSTANTS = {
  // Operation logs (only IDs/statuses - no sensitive data)
  DELETE_OPERATION: 'Permit deletion attempted',
  CREATE_OPERATION: 'Permit creation attempted',
  UPDATE_OPERATION: 'Permit update attempted',
  FETCH_OPERATION: 'Permit fetch attempted',

  // Error log prefixes
  CREATE_ERROR_PREFIX: 'Create permit error for ID:',
  DELETE_ERROR_PREFIX: 'Delete permit error for ID:',
  UPDATE_ERROR_PREFIX: 'Update permit error for ID:',
  FETCH_ERROR_PREFIX: 'Fetch permits error - Status:',

  // Generic error log
  ORIGINAL_ERROR_PREFIX: 'original error:',
  STATUS_LOG: 'Status:',
} as const;
