// Component constants for all-permits component
export class AllPermitsComponentConstants {
  // Column names for Mat Table
  static readonly COLUMN_NAMES = {
    PERMIT_NAME: 'permitName',
    APPLICANT_NAME: 'applicantName',
    PERMIT_TYPE: 'permitType',
    STATUS: 'status',
    UPDATE: 'update',
    DELETE: 'delete',
  } as const;

  // Columns to display in table (now includes action columns)
  static readonly COLUMNS_TO_DISPLAY: string[] = [
    AllPermitsComponentConstants.COLUMN_NAMES.PERMIT_NAME,
    AllPermitsComponentConstants.COLUMN_NAMES.APPLICANT_NAME,
    AllPermitsComponentConstants.COLUMN_NAMES.PERMIT_TYPE,
    AllPermitsComponentConstants.COLUMN_NAMES.STATUS,
    AllPermitsComponentConstants.COLUMN_NAMES.UPDATE,
    AllPermitsComponentConstants.COLUMN_NAMES.DELETE,
  ];
  static readonly UI_TEXT = {
    ABOUT_HEADER: 'About',
    NEW_PERMIT_BUTTON: 'New Permit',
    REFRESH_PERMITS_BUTTON: 'Refresh Permits',
    LOADING_MESSAGE: 'Loading permits...',
    NO_PERMITS_FOUND: 'No permits found',
    CREATE_FIRST_PERMIT: 'Create First Permit',
    PERMIT_NAME_HEADER: 'Permit Name',
    APPLICANT_NAME_HEADER: 'Applicant Name',
    PERMIT_TYPE_HEADER: 'Permit Type',
    STATUS_HEADER: 'Status',
    UPDATE_HEADER: 'Update',
    DELETE_HEADER: 'Delete',
    UPDATE_BUTTON: 'Update',
    DELETE_BUTTON: 'Delete',
    DELETING_BUTTON: 'Deleting...', // NEW
    EMPTY_ERROR: '',
  } as const;

  // ARIA Labels for accessibility
  static readonly ARIA_LABELS = {
    MAIN_PAGE_HEADER: 'Main page header for permit tracking system',
    ABOUT_SECTION_HEADER: 'About section header',
    ERROR_ALERT: 'Error alert message',
    SUCCESS_ALERT: 'Success alert message',
    PERMITS_CONTROLS: 'Permit control buttons',
    CREATE_NEW_PERMIT: 'Navigate to create new permit page',
    REFRESH_PERMITS_FROM_DB: 'Refresh permits list from database',
    PERMIT_TABLE: 'Table showing all permits with their details',
    PERMIT_NAME_CELL: 'Permit name for this row',
    APPLICANT_NAME_CELL: 'Applicant name for this row',
    PERMIT_TYPE_CELL: 'Permit type for this row',
    STATUS_CELL: 'Status for this row',
    UPDATE_PERMIT: (permitName: string) => `Update permit ${permitName}`,
    DELETE_PERMIT: (permitName: string) => `Delete permit ${permitName}`,
    PAGINATION_CONTROLS: 'Pagination controls for permit table',
  } as const;

  // Test IDs for Cypress testing
  static readonly TEST_IDS = {
    SUCCESS_ALERT: 'all-permits-success-alert',
    LOADING_SPINNER: 'all-permits-loading-spinner',
    LOADING_SPINNER_TEXT: 'all-permits-loading-text',
    EMPTY_STATE_CONTAINER: 'all-permits-empty-state',
    EMPTY_STATE_ALERT: 'all-permits-empty-alert',
    CREATE_FIRST_PERMIT_BUTTON: 'all-permits-create-first-button',
    REST_ERROR_ALERT: 'all-permits-rest-error',
    NEW_PERMIT_BUTTON: 'new-permit-button',
    REFRESH_PERMITS_BUTTON: 'refresh-permits-button',
    PERMITS_TABLE: 'permits-table',
    PERMIT_NAME_HEADER: 'permit-name-header',
    APPLICANT_NAME_HEADER: 'applicant-name-header',
    PERMIT_TYPE_HEADER: 'permit-type-header',
    STATUS_HEADER: 'status-header',
    UPDATE_HEADER: 'update-header',
    DELETE_HEADER: 'delete-header',
    PERMIT_NAME_CELL: (index: number) => `permit-name-cell-${index}`,
    APPLICANT_NAME_CELL: (index: number) => `applicant-name-cell-${index}`,
    PERMIT_TYPE_CELL: (index: number) => `permit-type-cell-${index}`,
    STATUS_CELL: (index: number) => `status-cell-${index}`,
    UPDATE_CELL: (index: number) => `update-cell-${index}`,
    DELETE_CELL: (index: number) => `delete-cell-${index}`,
    DELETE_LOADING_SPINNER: (index: number) =>
      `delete-loading-spinner-${index}`,
    DELETE_PERMIT_BUTTON: (index: number) => `delete-button-${index}`,
  } as const;

  // Pagination settings
  static readonly PAGINATION = {
    PAGE_SIZE_OPTIONS: [2, 4, 6, 10],
    DEFAULT_PAGE_SIZE: 10,
  } as const;

  // Page content
  static readonly APP_HEADER = 'Government Permit Tracking System';
  static readonly APP_DESCRIPTION_ENCODED = `Modern permit tracking application built for government-style environments using Java 17, Spring Boot 3, and PostgreSQL backend with Angular 19 frontend. Implements security-first architecture with input validation, request filtering, and comprehensive test coverage. Features RESTful API design, responsive UI, and local-first development approach with cloud deployment readiness.`;

  static readonly APP_DESCRIPTION = `Modern permit tracking application built for government-style environments using Java 17, Spring Boot 3, and PostgreSQL backend with Angular 19 frontend. Implements security-first architecture with input validation, request filtering, and comprehensive test coverage. Features RESTful API design, responsive UI, and local-first development approach with cloud deployment readiness.`;
}
