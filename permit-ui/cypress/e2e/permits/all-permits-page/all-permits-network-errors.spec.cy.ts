/*
 * OVERVIEW:
 * =========
 * This test suite validates that the All Permits page handles network failures and API errors gracefully,
 * ensuring government users receive clear error messaging and maintain access to application functionality
 * during backend service disruptions.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • Resilience: Application continues functioning during API failures
 * • User Experience: Clear, actionable error messages without technical details
 * • Graceful Degradation: Core features remain accessible during service failures
 *
 *  */

import { UI_TEXT } from '../../../../src/app/assets/constants/ui-text.constants';
import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { ApiIntercepts } from '../../../support/api-intercepts';
import { getTestSelector } from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';
import { UiAssertions } from '../../../support/ui-assertions';

describe('All Permits Page - Network Error Scenarios', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
  });

  it('should display error message when API server is unreachable (network error)', () => {
    // Intercept with server error using helper
    ApiIntercepts.interceptError('get', 'serverError', 'networkError');

    // Trigger refresh to cause network error
    UiActions.clickRefreshButton();

    // Wait for the failed request
    cy.wait('@networkError');

    // Verify error alert appears with proper messaging
    UiAssertions.verifyErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify table is still accessible (graceful degradation)
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE)
    ).should('be.visible');

    // Verify refresh button is still functional for retry
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON +
        '"]'
    );
  });

  it('should display error message when API returns 500 server error', () => {
    // Intercept and return server error using helper
    ApiIntercepts.interceptError('get', 'serverError', 'serverError');

    // Trigger refresh to cause server error
    UiActions.clickRefreshButton();

    // Wait for the failed request
    cy.wait('@serverError');

    // Verify error alert displays with proper accessibility
    UiAssertions.verifyErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify user can attempt recovery
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON +
        '"]'
    );
  });

  it('should display error message when API returns 404 not found', () => {
    // Intercept and return 404 error using helper
    ApiIntercepts.interceptError('get', 'notFound', 'notFoundError');

    // Trigger refresh to cause 404 error
    UiActions.clickRefreshButton();

    // Wait for the failed request
    cy.wait('@notFoundError');

    // Verify error handling for 404
    UiAssertions.verifyErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify graceful degradation - app still functional
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON)
    )
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should handle API timeout scenarios gracefully', () => {
    // Intercept with very long delay using helper
    ApiIntercepts.interceptLoading('get', 'extremelySlow', 'timeoutRequest');

    // Trigger refresh
    UiActions.clickRefreshButton();

    // Verify the UI remains responsive during long operation
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE)
    ).should('be.visible');
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON +
        '"]'
    );
  });
});
