/*
 * OVERVIEW:
 * =========
 * This test suite validates that the All Permits page handles error conditions gracefully
 * and provides government users with clear recovery paths when operations fail.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • User Experience: Clear error messaging and recovery options
 * • Resilience: Application remains functional despite backend failures
 * • Data Integrity: Error states don't interfere with successful operations
 */

import { UI_TEXT } from '../../../../src/app/assets/constants/ui-text.constants';
import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import {
  ApiOperation,
  ApiErrorType,
  ApiLoadingType,
} from '../../../support/api/api-enums';
import {
  getTestSelector,
  selector_shortcuts,
} from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('All Permits Page - Error Recovery and User Experience', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
  });

  it('should allow user to retry after network error', () => {
    // First request fails using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.NETWORK_ERROR,
      'firstFailure'
    );

    UiActions.clickRefreshButton();
    cy.wait('@firstFailure');

    // Verify error appears
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Set up successful retry using helper
    ApiIntercepts.interceptSuccess(ApiOperation.GET_LIST, 'successfulRetry');

    // Retry the operation
    UiActions.clickRefreshButton();
    cy.wait('@successfulRetry');

    // Verify error disappears and data loads
    UiAssertions.verifyAllPermitsNoError();
    cy.get(selector_shortcuts.permitRowName(0)).should('exist');
  });

  it('should maintain app functionality during error states', () => {
    // Set up error state using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.NETWORK_ERROR,
      'networkError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@networkError');

    // Verify error appears
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify all major app functions remain accessible
    UiActions.clickNewPermitButton();

    // Verify new permit modal can still open despite list error
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');

    // Close modal and verify refresh is still available
    UiActions.clickModalCloseButton();
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON +
        '"]'
    );
  });

  it('should handle multiple consecutive errors gracefully', () => {
    // First error using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.SERVER_ERROR,
      'firstError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@firstError');
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Second error (different type) using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.NOT_FOUND,
      'secondError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@secondError');

    // Verify error persists (doesn't stack multiple errors)
    const ERROR_ALERT_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.REST_ERROR_ALERT
    );
    cy.get(ERROR_ALERT_SELECTOR).should('have.length', 1);
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify app remains functional
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON +
        '"]'
    );
    UiAssertions.verifyButtonEnabled(
      '[data-testid="' +
        AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON +
        '"]'
    );
  });

  it('should persist error state across page interactions', () => {
    // Set up error state using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.SERVER_ERROR,
      'persistentError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@persistentError');

    // Verify error appears
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Interact with other page elements
    UiActions.clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
    UiActions.clickModalCloseButton();

    // Verify error message persists after modal interaction
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Verify error only clears with successful refresh
    ApiIntercepts.interceptSuccess(ApiOperation.EMPTY, 'successfulClear');

    UiActions.clickRefreshButton();
    cy.wait('@successfulClear');

    // Verify error clears after successful operation
    UiAssertions.verifyAllPermitsNoError();
  });

  it('should handle rapid successive error/success cycles', () => {
    // First error using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.SERVER_ERROR,
      'firstError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@firstError');
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Quick success using helper
    ApiIntercepts.interceptSuccess(ApiOperation.GET_LIST, 'quickSuccess');

    UiActions.clickRefreshButton();
    cy.wait('@quickSuccess');
    UiAssertions.verifyAllPermitsNoError();

    // Second error using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.NOT_FOUND,
      'secondError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@secondError');

    // Verify error reappears correctly
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);
  });

  it('should show appropriate loading states during error recovery', () => {
    // Set up initial error using helper
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.SERVER_ERROR,
      'initialError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@initialError');
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Set up delayed success for loading state testing
    ApiIntercepts.interceptLoading(
      ApiOperation.GET,
      ApiLoadingType.SLOW,
      'delayedRecovery'
    );

    // Attempt recovery
    UiActions.clickRefreshButton();

    // Verify loading spinner appears during recovery
    UiAssertions.verifyAllPermitsLoadingState();

    // Verify error persists during loading
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);

    // Wait for recovery completion
    cy.wait('@delayedRecovery');

    // Verify loading clears and error is gone
    UiActions.waitForAllPermitsLoadingToComplete();
    UiAssertions.verifyAllPermitsNoError();
  });

  it('should handle mixed delete errors and fetch errors independently', () => {
    // Set up successful fetch with data using helper
    ApiIntercepts.interceptSuccess(ApiOperation.GET_LIST, 'successfulFetch');

    // Load data successfully
    UiActions.clickRefreshButton();
    cy.wait('@successfulFetch');

    // Verify no errors initially
    UiAssertions.verifyAllPermitsNoError();

    // Set up delete error using helper
    ApiIntercepts.interceptError(
      ApiOperation.DELETE,
      ApiErrorType.SERVER_ERROR,
      'deleteError'
    );

    // Attempt delete that will fail
    cy.get(
      getTestSelector(
        AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(0)
      )
    ).click();
    cy.wait('@deleteError');

    // Verify delete error appears
    UiAssertions.verifyAllPermitsErrorMessage('Could not delete');

    // Now set up fetch error and try refresh
    ApiIntercepts.interceptError(
      ApiOperation.GET,
      ApiErrorType.SERVER_ERROR,
      'fetchError'
    );

    UiActions.clickRefreshButton();
    cy.wait('@fetchError');

    // Verify fetch error replaces delete error
    UiAssertions.verifyAllPermitsErrorMessage(UI_TEXT.SERVER_CONNECTION_ERROR);
    UiAssertions.verifyAllPermitsErrorMessageDoesNotContain('Could not delete');
  });

  // Tests that all different HTTP error types (400, 404, 500) show the same user-friendly error message
  // This ensures users get consistent messaging regardless of the specific technical error
  it('should provide consistent error messaging across different HTTP status codes', () => {
    // Define array of different HTTP error types to test (400 Bad Request, 404 Not Found, 500 Server Error)
    const errorTypes = [
      ApiErrorType.BAD_REQUEST,
      ApiErrorType.NOT_FOUND,
      ApiErrorType.SERVER_ERROR,
    ];

    // Loop through each error type to test consistency
    errorTypes.forEach((errorType, index) => {
      // Mock the API to return this specific error type when GET request is made
      // Creates a Cypress intercept with unique alias for this error type
      ApiIntercepts.interceptError(
        ApiOperation.GET,
        errorType,
        `error${errorType}`
      );

      // Trigger the API call by clicking refresh button
      UiActions.clickRefreshButton();
      // Wait for the specific error response to complete
      cy.wait(`@error${errorType}`);

      // Verify that regardless of the HTTP status code (400/404/500), 
      // the user always sees the same friendly "SERVER_CONNECTION_ERROR" message
      UiAssertions.verifyAllPermitsErrorMessage(
        UI_TEXT.SERVER_CONNECTION_ERROR
      );

      // Clear the error state before testing the next error type
      // (Skip clearing for the last iteration since test is ending)
      if (index < errorTypes.length - 1) {
        // Mock a successful empty response to clear the error
        ApiIntercepts.interceptSuccess(ApiOperation.EMPTY, `clear${errorType}`);

        // Click refresh to trigger the successful response
        UiActions.clickRefreshButton();
        // Wait for the successful clear response
        cy.wait(`@clear${errorType}`);
        // Verify the error message is gone before testing next error type
        UiAssertions.verifyAllPermitsNoError();
      }
    });
  });
});
