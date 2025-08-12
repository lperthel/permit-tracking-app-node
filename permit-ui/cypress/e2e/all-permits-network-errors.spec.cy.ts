import { UI_TEXT } from '../../src/app/assets/constants/ui-text.constants';
import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { dev_env } from '../../src/environments/environment';
import { getTestSelector } from '../support/cypress-selectors';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;
const API_BASE_URL = dev_env.apiUrl;

// String constants at top of file per coding guidelines
const PERMITS_API_ENDPOINT = '/permits';
const ERROR_ALERT_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.REST_ERROR_ALERT
);
const REFRESH_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
);
const NEW_PERMIT_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
);
const PERMITS_TABLE_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE
);

describe('All Permits Page - Network Error Scenarios', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should display error message when API server is unreachable (network error)', () => {
    // First intercept with delay and 500 error (simulates network timeout)
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 1000, // 1 second delay to see loading
      statusCode: 500,
      body: { error: 'Network connection failed' },
    }).as('networkError');

    // Trigger refresh to cause network error
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Wait for the failed request
    cy.wait('@networkError');

    // Verify error alert appears with server connection error message
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify table is still accessible (graceful degradation)
    cy.get(PERMITS_TABLE_SELECTOR).should('be.visible');

    // Verify refresh button is still functional for retry
    cy.get(REFRESH_BUTTON_SELECTOR).should('not.be.disabled');
  });

  it('should display error message when API returns 500 server error', () => {
    // Intercept and return server error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('serverError');

    // Trigger refresh to cause server error
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Wait for the failed request
    cy.wait('@serverError');

    // Verify error alert displays server error using UI_TEXT constant
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify error alert has proper ARIA attributes for accessibility
    cy.get(ERROR_ALERT_SELECTOR)
      .should('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'assertive');

    // Verify user can attempt recovery
    cy.get(REFRESH_BUTTON_SELECTOR).should('be.visible').and('not.be.disabled');
  });

  it('should display error message when API returns 404 not found', () => {
    // Intercept and return 404 error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 404,
      body: { error: 'Not Found' },
    }).as('notFoundError');

    // Trigger refresh to cause 404 error
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Wait for the failed request
    cy.wait('@notFoundError');

    // Verify error handling for 404 using UI_TEXT constant
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify graceful degradation - app still functional
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON)
    )
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should handle API timeout scenarios gracefully', () => {
    // Intercept with very long delay to simulate timeout
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 30000, // 30 second delay
      body: [],
    }).as('timeoutRequest');

    // Trigger refresh
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Verify the UI remains responsive during long operation
    cy.get(PERMITS_TABLE_SELECTOR).should('be.visible');
    cy.get(REFRESH_BUTTON_SELECTOR).should('be.visible');
  });
});
