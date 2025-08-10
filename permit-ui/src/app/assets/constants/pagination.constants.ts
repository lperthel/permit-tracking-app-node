export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10, // MOVED here from component-constants
  PAGE_SIZE_OPTIONS: [2, 4, 6, 10],

  // Pagination test IDs
  PAGINATION_TEST_IDS: {
    NEXT: 'pagination-next',
    PREV: 'pagination-prev',
    LAST: 'pagination-last',
    FIRST: 'pagination-first',
  },

  // CSS selectors for pagination buttons
  PAGINATION_SELECTORS: {
    NEXT: 'button.mat-mdc-paginator-navigation-next',
    PREV: 'button.mat-mdc-paginator-navigation-previous',
    LAST: 'button.mat-mdc-paginator-navigation-last',
    FIRST: 'button.mat-mdc-paginator-navigation-first',
  },
} as const;
