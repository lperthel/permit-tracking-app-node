import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { dev_env } from '../../src/environments/environment';
import { getTestSelector, selectors } from '../support/cypress-selectors';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;
const API_BASE_URL = dev_env.apiUrl;

// String constants at top of file per coding guidelines
const PERMITS_API_ENDPOINT = '/permits';
const LOADING_SPINNER_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER
);
const LOADING_SPINNER_TEXT_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER_TEXT
);
const REFRESH_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
);

const PERMITS_TABLE_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE
);

describe('All Permits Page - Loading State Behavior', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should show and hide loading spinner during network requests', () => {
    // Intercept with longer delay to guarantee we can observe loading state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 2000, // 2 second delay
      statusCode: 200,
      body: [],
    }).as('slowRequest');

    // Trigger refresh
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Immediately check for loading spinner
    cy.get(LOADING_SPINNER_SELECTOR, { timeout: 1000 }).should('exist');

    // Verify loading spinner contains accessible text
    cy.get(LOADING_SPINNER_TEXT_SELECTOR).should(
      'contain.text',
      AllPermitsComponentConstants.UI_TEXT.LOADING_MESSAGE
    );

    // Wait for request to complete
    cy.wait('@slowRequest');

    // Verify loading spinner disappears
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');
  });

  it('should show loading spinner with proper accessibility attributes', () => {
    // Intercept with delay to observe loading state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 3000,
      body: [
        {
          id: '1',
          permitName: 'Test Permit',
          applicantName: 'Test Applicant',
          permitType: 'Construction',
          status: 'PENDING',
        },
      ],
    }).as('slowLoad');

    // Trigger refresh
    cy.get(REFRESH_BUTTON_SELECTOR).click();
    // Immediately check for loading spinner with longer timeout
    cy.get(LOADING_SPINNER_SELECTOR, { timeout: 2000 }).should('exist');
    // Then verify accessibility attributes
    cy.get(LOADING_SPINNER_SELECTOR)
      .find('.spinner-border')
      .should('have.attr', 'role', 'status');

    cy.get(LOADING_SPINNER_TEXT_SELECTOR).should(
      'contain.text',
      AllPermitsComponentConstants.UI_TEXT.LOADING_MESSAGE
    );

    // Wait for request completion
    cy.wait('@slowLoad');

    // Verify loading spinner disappears
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');

    // Verify data loads correctly using data-testid selector
    cy.get(PERMITS_TABLE_SELECTOR).should('be.visible');
  });

  it('should prevent multiple simultaneous refresh requests', () => {
    // Intercept with delay
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 2000,
      body: [],
    }).as('slowRefresh');

    // Click refresh button
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Verify loading state
    cy.get(LOADING_SPINNER_SELECTOR).should('exist');

    // Attempt to click refresh again while loading
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Should only have one request (no double-loading)
    cy.get('@slowRefresh.all').should('have.length', 1);

    // Wait for completion
    cy.wait('@slowRefresh');
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');
  });

  it('should maintain UI responsiveness during loading', () => {
    // Intercept with moderate delay
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 1500,
      body: [],
    }).as('moderateDelay');

    // Trigger refresh
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Verify loading state
    cy.get(LOADING_SPINNER_SELECTOR).should('exist');

    // Verify other UI elements remain accessible during loading
    cy.get(selectors.table).should('be.visible');
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON)
    ).should('be.visible');

    // Wait for completion
    cy.wait('@moderateDelay');

    // Verify loading completes
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');
  });
});
