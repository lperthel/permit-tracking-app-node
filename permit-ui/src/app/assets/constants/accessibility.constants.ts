export const ARIA_LABELS = {
  // Page structure
  MAIN_PAGE_HEADER: 'Main page header',
  ABOUT_SECTION_HEADER: 'About this app section',

  // Alerts
  ERROR_ALERT: 'Error alert',
  SUCCESS_ALERT: 'Success alert',

  // Controls and navigation
  PERMITS_CONTROLS: 'Permits controls',
  CREATE_NEW_PERMIT: 'Create new permit',
  REFRESH_PERMITS_FROM_DB: 'Refresh permit list from database',

  // Table structure
  PERMIT_TABLE: 'Permit table',
  PAGINATION_CONTROLS: 'Permit table pagination controls',

  // Table column headers (these are implicit from the table structure)
  PERMIT_NAME_HEADER: 'Permit name column',
  APPLICANT_NAME_HEADER: 'Applicant name column',
  PERMIT_TYPE_HEADER: 'Permit type column',
  STATUS_HEADER: 'Status column',
  UPDATE_HEADER: 'Update actions column',
  DELETE_HEADER: 'Delete actions column',

  // Table cells - static labels
  PERMIT_NAME_CELL: 'Permit name',
  APPLICANT_NAME_CELL: 'Applicant name',
  PERMIT_TYPE_CELL: 'Permit type',
  STATUS_CELL: 'Status',

  // Action buttons - dynamic labels
  UPDATE_PERMIT: (permitName: string) => `Update permit ${permitName}`,
  DELETE_PERMIT: (permitName: string) => `Delete permit ${permitName}`,
} as const;
