/*
 * Tests error handling during permit update operations including
 * server errors, network failures, and error state recovery.
 */

import { PERMIT_FORM_SELECTORS } from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import {
  ApiErrorType,
  ApiLoadingType,
  ApiOperation,
  HttpMethod,
} from '../../../support/api/api-enums';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import { PermitUpdateTestSetup } from '../../../support/test-setup/permit-update-test-setup';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Error Handling', () => {
  let testPermitId: string | undefined;

  afterEach(() => {
    // Clean up test permit using teardown helper
    PermitUpdateTestSetup.teardown(testPermitId);
    testPermitId = undefined;
  });

  it('should handle update server errors gracefully', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Set up API intercept to simulate server error
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.SERVER_ERROR,
        'updateServerError'
      );

      // Fill form and attempt update
      UiActions.fillPermitFormFromFixture(
        PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
      );
      UiActions.clickSubmitButton();

      // Wait for error response
      cy.wait('@updateServerError');

      // Verify error handling (modal should remain open)
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );

      // Verify form data is preserved for retry using helper assertion
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_NAME)).should(
        'not.have.value',
        ''
      );
    });
  });

  it('should handle network connection failures during update', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Set up network error
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.NETWORK_ERROR,
        'updateNetworkError'
      );

      // Fill form and attempt update
      UiActions.fillPermitFormFromFixture(
        PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
      );
      UiActions.clickSubmitButton();

      // Wait for network error response
      cy.wait('@updateNetworkError');

      // Verify modal remains open for retry
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );

      // Verify application remains responsive
      UiAssertions.verifySubmitButtonEnabled();
    });
  });

  it('should handle timeout errors during update operations', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Set up timeout error
      ApiIntercepts.interceptLoading(
        ApiOperation.UPDATE,
        ApiLoadingType.TIMEOUT,
        'updateTimeout'
      );

      // Fill form and attempt update
      UiActions.fillPermitFormFromFixture(
        PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
      );
      UiActions.clickSubmitButton();

      cy.wait(1000);
      // Verify system handles timeout gracefully
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );

      // Verify form remains accessible during timeout
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.INPUT_PERMIT_NAME)).should(
        'be.visible'
      );

      // Verify modal close button remains functional during timeout
      UiActions.clickModalCloseButton();
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'not.exist'
      );
    });
  });

  it('should preserve form state during multiple error scenarios', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Set up first server error
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.SERVER_ERROR,
        'updateError1'
      );

      // Fill form with specific test data using helper methods
      const testData = {
        permitName: 'Test Error Recovery',
        applicantName: 'Error Test Applicant',
        permitType: 'Error Test Type',
      };

      UiActions.clearPermitForm();
      UiActions.typeInPermitNameField(testData.permitName);
      UiActions.typeInApplicantNameField(testData.applicantName);
      UiActions.typeInPermitTypeField(testData.permitType);
      UiActions.selectStatus('PENDING');

      UiActions.clickSubmitButton();
      cy.wait('@updateError1');

      // Verify form data is preserved after first error using helper assertions
      UiAssertions.verifyPermitFormData({
        permitName: testData.permitName,
        applicantName: testData.applicantName,
        permitType: testData.permitType,
        status: 'PENDING' as any,
      });

      // Set up second error scenario
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.NETWORK_ERROR,
        'updateError2'
      );

      // Try again - form data should still be preserved
      UiActions.clickSubmitButton();
      cy.wait('@updateError2');

      // Verify form data is still preserved after second error
      UiAssertions.verifyPermitFormData({
        permitName: testData.permitName,
        applicantName: testData.applicantName,
        permitType: testData.permitType,
        status: 'PENDING' as any,
      });
    });
  });

  it.only('should allow retry after error recovery', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // First attempt with error
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.SERVER_ERROR,
        'updateErrorFirst'
      );

      UiActions.fillPermitFormFromFixture(
        PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
      );
      UiActions.clickSubmitButton();
      cy.wait('@updateErrorFirst');

      // Verify error occurred but modal stays open
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );

      // Clear previous error intercept - let retry go to real backend
      ApiIntercepts.clearIntercept(HttpMethod.PUT, 'updateErrorFirst');
      console.log('clear error first');
      // Retry submission (hits real backend)
      UiActions.clickSubmitButton();
      cy.wait(2000); // Wait for real API call

      // Verify successful update (modal should close)
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'not.exist'
      );

      // Verify data updated in table
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiAssertions.verifyFixturePermitInTable(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER,
          lastRowIndex
        );
      });
    });
  });

  it('should handle validation errors separately from server errors', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Clear required field to trigger validation error
      UiActions.clearFormField('permitName');
      UiActions.clickSubmitButton();

      // Verify validation error appears (client-side, no API call)
      UiAssertions.verifyFormError('permitName');

      // Fix validation error
      UiActions.typeInPermitNameField('Valid Permit Name');

      // Now trigger server error
      ApiIntercepts.interceptError(
        ApiOperation.UPDATE,
        ApiErrorType.SERVER_ERROR,
        'updateServerError'
      );

      UiActions.clickSubmitButton();
      cy.wait('@updateServerError');

      // Verify server error handling is different from validation
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'exist'
      );

      // Form should still be valid (no validation errors)
      UiAssertions.verifyNoPermitFormErrors();
    });
  });
});
