import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { dev_env } from '../../src/environments/environment';
import { getTestSelector } from '../support/cypress-selectors';
import { waitForPermitTable } from '../support/permit_test_helpers';

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
const PERMITS_TABLE_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE
);

const PERMIT_ROW_DELETE_SELECTOR = (index: number) =>
  getTestSelector(AllPermitsComponentConstants.TEST_IDS.DELETE_CELL(index));
const PERMIT_ROW_NAME_SELECTOR = (index: number) =>
  getTestSelector(
    AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(index)
  );
const DELETE_LOADING_SPINNER_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.DELETE_LOADING_SPINNER(0)
);
const DELETE_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(0)
);
const DELETE_BUTTON_SELECTOR_1 = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(1)
);
const DELETING_BUTTON_TEXT =
  AllPermitsComponentConstants.UI_TEXT.DELETING_BUTTON;
const DELETE_BUTTON_TEXT = AllPermitsComponentConstants.UI_TEXT.DELETE_BUTTON;

describe('All Permits Page - Delete Operation Error Scenarios', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
    // Wait for permits to load using existing helper
    waitForPermitTable();
  });

  it('should display error message when delete operation fails with server error', () => {
    // Intercept delete request and force server error
    cy.intercept('DELETE', `${API_BASE_URL}${PERMITS_API_ENDPOINT}/*`, {
      statusCode: 500,
      body: { error: 'Delete operation failed' },
    }).as('deleteServerError');

    // Attempt to delete first permit using data-testid selector
    cy.get(PERMIT_ROW_DELETE_SELECTOR(0)).find('button').click();

    // Wait for failed delete request
    cy.wait('@deleteServerError');

    // Verify error alert appears with server connection error message
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should('contain.text', 'Could not delete');

    // Verify permit is still in table (delete failed gracefully)
    cy.get(PERMIT_ROW_NAME_SELECTOR(0)).should('exist');

    // Verify user can try other operations
    cy.get(REFRESH_BUTTON_SELECTOR).should('not.be.disabled');

    // Verify table remains accessible
    cy.get(PERMITS_TABLE_SELECTOR).should('be.visible');
  });

  it('should handle delete request timeout gracefully', () => {
    // String constants at top per coding guidelines
    const DELETE_BUTTON_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(0)
    );
    const DELETE_LOADING_SPINNER_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.DELETE_LOADING_SPINNER(0)
    );
    const DELETING_BUTTON_TEXT =
      AllPermitsComponentConstants.UI_TEXT.DELETING_BUTTON;
    const DELETE_BUTTON_TEXT =
      AllPermitsComponentConstants.UI_TEXT.DELETE_BUTTON;

    // Intercept delete request with long delay to simulate timeout
    cy.intercept('DELETE', '**/permits/**', {
      delay: 5000,
      statusCode: 200,
      body: { message: 'Deleted successfully' },
    }).as('deleteTimeout');

    // Verify initial button state
    cy.get(DELETE_BUTTON_SELECTOR)
      .should('not.be.disabled')
      .and('contain.text', DELETE_BUTTON_TEXT);

    // Click delete button
    cy.get(DELETE_BUTTON_SELECTOR).click();

    // Verify loading state appears
    cy.get(DELETE_BUTTON_SELECTOR)
      .should('be.disabled')
      .and('contain.text', DELETING_BUTTON_TEXT);

    // Verify loading spinner is visible
    cy.get(DELETE_LOADING_SPINNER_SELECTOR).should('be.visible');

    // Verify other UI elements remain functional
    cy.get(PERMITS_TABLE_SELECTOR).should('be.visible');
    cy.get(REFRESH_BUTTON_SELECTOR).should('be.visible');

    // Verify other delete buttons still work
    cy.get(
      getTestSelector(
        AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(1)
      )
    )
      .should('not.be.disabled')
      .and('contain.text', DELETE_BUTTON_TEXT);
  });

  it('should display error message when delete receives network connection failure', () => {
    // Intercept delete request and force network error
    cy.intercept('DELETE', `${API_BASE_URL}${PERMITS_API_ENDPOINT}/*`, {
      forceNetworkError: true,
    }).as('deleteNetworkError');

    // Attempt to delete using data-testid selector
    cy.get(PERMIT_ROW_DELETE_SELECTOR(0)).find('button').click();

    // Wait for network error
    cy.wait('@deleteNetworkError');

    // Verify error handling for network failure
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should('contain.text', 'Could not delete');

    // Verify permit data is restored (optimistic update rolled back)
    cy.get(PERMIT_ROW_NAME_SELECTOR(0)).should('exist');

    // Verify app remains functional after network error
    cy.get(REFRESH_BUTTON_SELECTOR).should('be.visible').and('not.be.disabled');
  });

  it('should handle delete operation with permission denied error', () => {
    // Intercept delete with 403 Forbidden (permission error)
    cy.intercept('DELETE', `${API_BASE_URL}${PERMITS_API_ENDPOINT}/*`, {
      statusCode: 403,
      body: { error: 'Insufficient permissions to delete this permit' },
    }).as('deletePermissionError');

    // Attempt to delete using data-testid selector
    cy.get(PERMIT_ROW_DELETE_SELECTOR(0)).find('button').click();

    // Wait for permission error
    cy.wait('@deletePermissionError');

    // Verify error handling for permission denial
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should('contain.text', 'Could not delete');

    // Verify permit remains in table (delete was prevented)
    cy.get(PERMIT_ROW_NAME_SELECTOR(0)).should('exist');

    // Verify other operations still work (user can try different actions)
    cy.get(REFRESH_BUTTON_SELECTOR).should('not.be.disabled');

    // Verify other permits can still be interacted with
    cy.get(PERMIT_ROW_DELETE_SELECTOR(1))
      .find('button')
      .should('not.be.disabled');
  });

  it('should handle multiple consecutive delete failures gracefully', () => {
    // Set up server error for all delete requests
    cy.intercept('DELETE', `${API_BASE_URL}${PERMITS_API_ENDPOINT}/*`, {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('deleteFailure');

    // Attempt to delete first permit
    cy.get(PERMIT_ROW_DELETE_SELECTOR(0)).find('button').click();
    cy.wait('@deleteFailure');

    // Verify first error appears
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Attempt to delete second permit (should ADD to existing error)
    cy.get(PERMIT_ROW_DELETE_SELECTOR(1)).find('button').click();
    cy.wait('@deleteFailure');

    // Verify error alert shows BOTH failures
    cy.get(ERROR_ALERT_SELECTOR).should('have.length', 1); // Still one alert element
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      'Could not delete 2 permits:'
    );
    // Verify both permits still exist
    cy.get(PERMIT_ROW_NAME_SELECTOR(0)).should('exist');
    cy.get(PERMIT_ROW_NAME_SELECTOR(1)).should('exist');

    // Verify app remains functional
    cy.get(REFRESH_BUTTON_SELECTOR).should('not.be.disabled');
  });
});
