import { UI_TEXT } from '../../../../src/app/assets/constants/ui-text.constants';
import { PERMIT_FORM_SELECTORS } from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../../src/app/permits/shared/models/permit-status.enums';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import { UiActions } from '../../../support/ui/ui-actions';
import {
  getTestSelector,
  selector_shortcuts,
} from '../../../support/ui/cypress-selectors';

/*
 * OVERVIEW:
 * =========
 * This test suite validates that the New Permit page handles API failures and network errors gracefully,
 * ensuring government users receive clear error messaging and can recover from failed permit creation
 * operations without losing form data or application functionality.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • Data Protection: Failed submissions don't corrupt application state
 * • User Experience: Clear error messaging for permit creation failures
 * • Resilience: Application remains functional after API operation errors
 * • Error Recovery: Users can retry failed operations with preserved form data
 * • Professional Standards: Loading states and error handling meet government UX standards
 *
 * TEST ISOLATION STRATEGY:
 * ========================
 * Tests use API intercepts to simulate various error conditions without creating
 * actual backend data. Each test focuses on error handling and recovery workflows.
 */

describe('New Permit Page - Error Scenarios and Recovery', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    UiActions.clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  it('should display error message when permit creation fails with server error', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

    // Intercept permit creation request and force server error
    ApiIntercepts.interceptError('create', 'serverError', 'createServerError');

    // Submit form
    UiActions.clickSubmitButton();

    // Wait for failed request
    cy.wait('@createServerError');

    // Verify error alert appears
    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );
    cy.get(REST_ERROR_SELECTOR).should('be.visible');
    cy.get(REST_ERROR_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify modal remains open for retry
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');

    // Verify form data is preserved (check a few key fields)
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'not.have.value',
      ''
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'not.have.value',
      ''
    );

    // Verify submit button is still functional for retry
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
      'not.be.disabled'
    );
  });

  it('should display error message when permit creation receives network connection failure', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

    // Intercept permit creation request and force network error
    ApiIntercepts.interceptError(
      'create',
      'networkError',
      'createNetworkError'
    );

    // Submit form
    UiActions.clickSubmitButton();

    // Wait for network error
    cy.wait('@createNetworkError');

    // Verify error handling for network failure
    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );
    cy.get(REST_ERROR_SELECTOR).should('be.visible');
    cy.get(REST_ERROR_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Verify form data preservation during network error
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'not.have.value',
      ''
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'not.have.value',
      ''
    );

    // Verify modal remains open for user recovery
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');

    // Verify app remains functional after network error
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON))
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should handle permit creation timeout scenarios gracefully', () => {
    // Fill form; with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.TIMEOUT_TEST_PERMIT);

    // Intercept permit creation request with loading delay
    ApiIntercepts.interceptLoading('create', 'slow', 'createTimeout');

    // Submit form
    UiActions.clickSubmitButton();

    // Verify submit button becomes disabled during submission
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
      'be.disabled'
    );

    // Verify form remains accessible during timeout
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
    cy.get(selector_shortcuts.permitForm.inputPermitName).should('be.visible');

    // Verify modal close button remains functional during timeout
    UiActions.clickModalCloseButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'not.exist'
    );
  });

  it('should allow user to retry after creation error is resolved', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

    // First request fails
    ApiIntercepts.interceptError('create', 'serverError', 'firstFailure');

    // Submit form
    UiActions.clickSubmitButton();
    cy.wait('@firstFailure');

    // Verify error appears
    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );
    cy.get(REST_ERROR_SELECTOR).should('be.visible');
    cy.get(REST_ERROR_SELECTOR).should(
      'contain.text',
      UI_TEXT.SERVER_CONNECTION_ERROR
    );

    // Set up successful retry
    ApiIntercepts.interceptSuccess('create', 'successfulRetry');

    // Retry the operation
    UiActions.clickSubmitButton();
    cy.wait('@successfulRetry');

    // Verify error disappears and modal closes (success navigation)
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'not.exist'
    );

    // Verify we're back on main page (successful creation)
    cy.get(selector_shortcuts.table).should('be.visible');
  });

  it('should preserve form data during multiple consecutive creation failures', () => {
    // Use specific test data for data persistence verification
    const testData = {
      permitName: 'Persistent Test Permit',
      applicantName: 'Persistent Test Applicant',
      permitType: 'Electrical',
      status: PermitStatus.SUBMITTED,
    };

    // Fill form with specific test data
    UiActions.fillPermitForm(
      testData.permitName,
      testData.applicantName,
      testData.permitType,
      testData.status
    );

    // Set up server error for all requests
    ApiIntercepts.interceptError('create', 'serverError', 'persistentFailure');

    // First submission failure
    UiActions.clickSubmitButton();
    cy.wait('@persistentFailure');

    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );
    cy.get(REST_ERROR_SELECTOR).should('be.visible');

    // Verify data persists after first failure
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'have.value',
      testData.permitName
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'have.value',
      testData.applicantName
    );
    cy.get(selector_shortcuts.permitForm.inputPermitType).should(
      'have.value',
      testData.permitType
    );
    cy.get(selector_shortcuts.permitForm.inputStatus).should(
      'have.value',
      testData.status
    );

    // Second submission failure
    UiActions.clickSubmitButton();
    cy.wait('@persistentFailure');

    // Verify data still persists after second failure
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'have.value',
      testData.permitName
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'have.value',
      testData.applicantName
    );

    // Verify error message remains visible
    cy.get(REST_ERROR_SELECTOR).should('be.visible');

    // Verify form remains functional
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
      'not.be.disabled'
    );
  });

  it('should handle different HTTP error status codes consistently', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(
      PermitFixtureKeys.ERROR_SCENARIO_PERMIT
    );

    const errorTypes = [
      'badRequest',
      'forbidden',
      'notFound',
      'serverError',
    ] as const;

    errorTypes.forEach((errorType, index) => {
      // Set up error with specific type using helper
      ApiIntercepts.interceptError('create', errorType, `error${errorType}`);

      // Submit form
      UiActions.clickSubmitButton();
      cy.wait(`@error${errorType}`);

      // Verify consistent error message regardless of error type
      const REST_ERROR_SELECTOR = getTestSelector(
        PERMIT_FORM_SELECTORS.REST_ERROR
      );
      cy.get(REST_ERROR_SELECTOR).should('be.visible');
      cy.get(REST_ERROR_SELECTOR).should(
        'contain.text',
        UI_TEXT.SERVER_CONNECTION_ERROR
      );

      // Verify form remains accessible
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
        'not.be.disabled'
      );

      // Add small delay between tests (except last)
      if (index < errorTypes.length - 1) {
        cy.wait(100);
      }
    });
  });

  it('should maintain professional loading states during creation operations', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

    // Intercept with delay to observe loading behavior
    ApiIntercepts.interceptLoading('create', 'slow', 'delayedSuccess');

    // Submit form
    UiActions.clickSubmitButton();

    // Verify submit button becomes disabled during loading
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
      'be.disabled'
    );

    // Verify modal remains open during loading
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');

    // Verify form fields remain visible during loading
    cy.get(selector_shortcuts.permitForm.inputPermitName).should('be.visible');
    cy.get(selector_shortcuts.permitForm.inputApplicant).should('be.visible');

    // Wait for completion
    cy.wait('@delayedSuccess');

    // Verify successful completion (modal closes, redirects to main page)
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'not.exist'
    );
    cy.get(selector_shortcuts.table).should('be.visible');
  });

  it('should clear error messages on successful form submission after previous failures', () => {
    // Fill form with fixture data
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

    // First request fails
    ApiIntercepts.interceptError('create', 'serverError', 'initialError');

    UiActions.clickSubmitButton();
    cy.wait('@initialError');

    // Verify error appears
    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );
    cy.get(REST_ERROR_SELECTOR).should('be.visible');

    // Set up successful request
    ApiIntercepts.interceptSuccess('create', 'clearingSuccess');

    // Submit again (should succeed)
    UiActions.clickSubmitButton();
    cy.wait('@clearingSuccess');

    // Verify success: error clears and modal closes
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'not.exist'
    );
    cy.get(selector_shortcuts.table).should('be.visible');
  });
});
