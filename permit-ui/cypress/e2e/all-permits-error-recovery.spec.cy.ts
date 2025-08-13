import { UI_TEXT } from '../../src/app/assets/constants/ui-text.constants';
import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../src/app/permits/permit-form-model/permit-form.constants';
import { dev_env } from '../../src/environments/environment';
import { getTestSelector, selectors } from '../support/cypress-selectors';

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

const MODAL_HEADER_SELECTOR = getTestSelector(
  PERMIT_FORM_SELECTORS.MODAL_HEADER
);

const MODAL_CLOSE_BUTTON_SELECTOR = getTestSelector(
  PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON
);
/*
 * OVERVIEW:
 * =========
 * This test suite validates that the All Permits page handles error conditions gracefully
 * and provides government users with clear recovery paths when operations fail.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • User Experience: Clear error messaging and recovery options
 * • Section 508 Compliance: Keyboard navigation and screen reader support during errors
 * • Resilience: Application remains functional despite backend failures
 * • Data Integrity: Error states don't interfere with successful operations
 *
 * TEST CATEGORIES:
 * ================
 *
 * 1. NETWORK ERROR RECOVERY
 *    - Network timeouts and connection failures
 *    - User ability to retry failed operations
 *    - Error message clarity and actionability
 *
 * 2. APPLICATION FUNCTIONALITY DURING ERRORS
 *    - Other features remain accessible when one operation fails
 *    - Modal dialogs work despite list errors
 *    - Navigation between features during error states
 *
 * 3. ERROR STATE PERSISTENCE AND MANAGEMENT
 *    - Errors persist across page interactions until resolved
 *    - Multiple consecutive errors don't stack or corrupt state
 *    - Success operations properly clear previous errors
 *    - Rapid error/success cycles handled gracefully
 *
 * 4. LOADING STATE MANAGEMENT
 *    - Visual feedback during error recovery attempts
 *    - Loading spinners during delayed operations
 *    - Error states maintained during loading operations
 *
 * 5. ERROR TYPE ISOLATION
 *    - Delete operation errors independent from fetch errors
 *    - Different error types handled with appropriate messaging
 *    - Mixed success/failure scenarios handled correctly
 *
 * 6. CONSISTENT ERROR MESSAGING
 *    - All HTTP status codes show user-friendly messages
 *    - Technical error details hidden from government users
 *    - Consistent messaging regardless of backend failure type
 *
 * 7. BASIC ACCESSIBILITY COMPLIANCE (Section 508)
 *    - Error alerts properly announced to screen readers
 *    - Keyboard navigation works during error states
 *    - Focus management preserved during errors
 *    - Tab order maintained with error alerts present
 *
 * BUSINESS VALUE:
 * ===============
 * These tests ensure government users can:
 * • Understand what went wrong when operations fail
 * • Take appropriate action to recover from errors
 * • Continue using other application features during partial failures
 * • Access the application using assistive technologies during errors
 * • Trust that the application handles failures professionally
 *
 * TECHNICAL VALIDATION:
 * =====================
 * • Error boundaries don't crash the application
 * • State management handles error conditions properly
 * • UI components remain interactive during error states
 * • Accessibility attributes work correctly with error alerts
 * • Tab navigation using cypress-plugin-tab functions during errors
 */

describe('All Permits Page - Error Recovery and User Experience', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should allow user to retry after network error', () => {
    // First request fails
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      forceNetworkError: true,
    }).as('firstFailure');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@firstFailure');

    // Verify error appears using UI_TEXT constant
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Set up successful retry
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 200,
      body: [
        {
          id: '1',
          permitName: 'Test Permit',
          applicantName: 'Test Applicant',
          permitType: 'Construction',
          status: 'PENDING',
        },
      ],
    }).as('successfulRetry');

    // Retry the operation
    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@successfulRetry');

    // Verify error disappears and data loads using existing selectors
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');
    cy.get(selectors.permitRowName(0)).should('contain.text', 'Test Permit');
  });

  it('should maintain app functionality during error states', () => {
    // Set up error state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      forceNetworkError: true,
    }).as('networkError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@networkError');

    // Verify error appears using UI_TEXT constant
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify all major app functions remain accessible using existing selectors
    cy.get(NEW_PERMIT_BUTTON_SELECTOR)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Verify new permit modal can still open despite list error using existing selector
    cy.get(MODAL_HEADER_SELECTOR).should('exist');

    // Close modal and verify refresh is still available using existing selector
    cy.get(MODAL_CLOSE_BUTTON_SELECTOR).click();
    cy.get(REFRESH_BUTTON_SELECTOR).should('be.visible').and('not.be.disabled');
  });
  it('should provide accessible error messages for screen readers', () => {
    // Set up error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('serverError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@serverError');

    // Verify error alert has proper accessibility attributes
    cy.get(ERROR_ALERT_SELECTOR)
      .should('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'assertive')
      .and('have.attr', 'tabindex', '0');

    // Verify error message is focusable for keyboard navigation
    cy.get(ERROR_ALERT_SELECTOR).focus();
    cy.get(ERROR_ALERT_SELECTOR).should('be.focused');
  });
  it('should handle multiple consecutive errors gracefully', () => {
    // First error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('firstError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@firstError');
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Second error (different type)
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 404,
    }).as('secondError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@secondError');

    // Verify error persists (doesn't stack multiple errors)
    cy.get(ERROR_ALERT_SELECTOR).should('have.length', 1);
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify app remains functional
    cy.get(REFRESH_BUTTON_SELECTOR).should('not.be.disabled');
    cy.get(NEW_PERMIT_BUTTON_SELECTOR).should('not.be.disabled');
  });

  it('should persist error state across page interactions', () => {
    // Set up error state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('persistentError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@persistentError');

    // Verify error appears
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Interact with other page elements
    cy.get(NEW_PERMIT_BUTTON_SELECTOR).click();
    cy.get(MODAL_HEADER_SELECTOR).should('exist');
    cy.get(MODAL_CLOSE_BUTTON_SELECTOR).click();

    // Verify error message persists after modal interaction
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify error only clears with successful refresh
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 200,
      body: [],
    }).as('successfulClear');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@successfulClear');

    // Verify error clears after successful operation
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');
  });

  it('should handle rapid successive error/success cycles', () => {
    // Rapid error -> success -> error pattern

    // First error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('firstError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@firstError');
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Quick success
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 200,
      body: [
        {
          id: '1',
          permitName: 'Success Permit',
          applicantName: 'Success Applicant',
          permitType: 'Success Type',
          status: 'APPROVED',
        },
      ],
    }).as('quickSuccess');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@quickSuccess');
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');

    // Second error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 404,
    }).as('secondError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@secondError');

    // Verify error reappears correctly
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );
  });

  it('should show appropriate loading states during error recovery', () => {
    // Set up initial error
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('initialError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@initialError');
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Set up delayed success for loading state testing
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 2000,
      statusCode: 200,
      body: [],
    }).as('delayedRecovery');

    // Attempt recovery
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Verify loading spinner appears during recovery
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER)
    ).should('be.visible');

    // Verify error persists during loading
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Wait for recovery completion
    cy.wait('@delayedRecovery');

    // Verify loading clears and error is gone
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER)
    ).should('not.exist');
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');
  });

  it('should handle mixed delete errors and fetch errors independently', () => {
    // Set up successful fetch with data
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 200,
      body: [
        {
          id: '1',
          permitName: 'Deletable Permit',
          applicantName: 'Test Applicant',
          permitType: 'Test Type',
          status: 'APPROVED',
        },
      ],
    }).as('successfulFetch');

    // Load data successfully
    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@successfulFetch');

    // Verify no errors initially
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');

    // Set up delete error
    cy.intercept('DELETE', `${API_BASE_URL}${PERMITS_API_ENDPOINT}/*`, {
      statusCode: 500,
      body: { error: 'Delete failed' },
    }).as('deleteError');

    // Attempt delete that will fail
    cy.get(
      getTestSelector(
        AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(0)
      )
    ).click();
    cy.wait('@deleteError');

    // Verify delete error appears with clean message
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should('contain.text', 'Could not delete');

    // Now set up fetch error and try refresh
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 503,
    }).as('fetchError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@fetchError');

    // Verify fetch error replaces delete error (new error takes precedence)
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );
  });

  it('should provide consistent error messaging across different HTTP status codes', () => {
    const errorCodes = [400, 401, 403, 404, 500, 502, 503];

    errorCodes.forEach((statusCode, index) => {
      // Set up error with specific status code
      cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
        statusCode: statusCode,
      }).as(`error${statusCode}`);

      cy.get(REFRESH_BUTTON_SELECTOR).click();
      cy.wait(`@error${statusCode}`);

      // Verify consistent error message regardless of status code
      cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
      cy.get(ERROR_ALERT_SELECTOR).should(
        'contain.text',
        UI_TEXT.SERVER_CONNECTION_ERROR
      );

      // Clear error for next iteration (except last)
      if (index < errorCodes.length - 1) {
        cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
          statusCode: 200,
          body: [],
        }).as(`clear${statusCode}`);

        cy.get(REFRESH_BUTTON_SELECTOR).click();
        cy.wait(`@clear${statusCode}`);
        cy.get(ERROR_ALERT_SELECTOR).should('not.exist');
      }
    });
  });

  it('should maintain keyboard accessibility during error states', () => {
    // Set up error state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 500,
    }).as('keyboardTestError');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@keyboardTestError');

    // Verify error alert has proper accessibility attributes
    cy.get(ERROR_ALERT_SELECTOR)
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'assertive')
      .and('have.attr', 'tabindex', '0');

    // Verify error alert can be focused directly
    cy.get(ERROR_ALERT_SELECTOR).focus();
    cy.get(ERROR_ALERT_SELECTOR).should('be.focused');

    // Test tab navigation - start from a known element since error alert might be first
    cy.get(NEW_PERMIT_BUTTON_SELECTOR).focus(); // Start from New Permit button
    cy.focused().should(
      'have.attr',
      'data-testid',
      AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
    );

    cy.focused().tab(); // Tab to next element (should be refresh button)
    cy.focused().should(
      'have.attr',
      'data-testid',
      AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
    );

    // Test that we can tab from refresh button to other elements
    cy.focused().tab();
    cy.focused().should('exist'); // Should focus something (could be error alert or table)

    // Verify refresh button works with keyboard activation
    cy.get(REFRESH_BUTTON_SELECTOR).focus().type('{enter}');
    cy.wait('@keyboardTestError');

    // Error should still be present and accessible
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');

    // Verify we can still navigate to key elements after error retry
    cy.get(NEW_PERMIT_BUTTON_SELECTOR).focus();
    cy.focused().should(
      'have.attr',
      'data-testid',
      AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
    );
  });
});
