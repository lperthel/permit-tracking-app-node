export const TEST_IDS = {
  // Buttons
  NEW_PERMIT_BUTTON: 'new-permit-button',
  REFRESH_PERMITS_BUTTON: 'refresh-permits-from-db',

  // Table
  PERMITS_TABLE: 'permits-table',

  // Table headers
  PERMIT_NAME_HEADER: 'permits-table-permit-name-header',
  APPLICANT_NAME_HEADER: 'permits-table-applicant-name-header',
  PERMIT_TYPE_HEADER: 'permits-table-permit-type-header',
  STATUS_HEADER: 'permits-table-status-header',
  UPDATE_HEADER: 'permits-table-update-header',
  DELETE_HEADER: 'permits-table-delete-header',

  // Table cells (functions for dynamic IDs)
  PERMIT_NAME_CELL: (index: number) => `permits-table-permit-name-cell${index}`,
  APPLICANT_NAME_CELL: (index: number) =>
    `permits-table-applicant-name-cell${index}`,
  PERMIT_TYPE_CELL: (index: number) => `permits-table-permit-type-cell${index}`,
  STATUS_CELL: (index: number) => `permits-table-status-cell${index}`,
  UPDATE_CELL: (index: number) => `permits-table-update-cell${index}`,
  DELETE_CELL: (index: number) => `permits-table-delete-cell${index}`,
} as const;
