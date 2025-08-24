/*
 * Tests error handling during permit update operations including
 * server errors, network failures, and error state recovery.
 */

import { PERMIT_FORM_SELECTORS } from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { ApiErrorType, ApiLoadingType, ApiOperation } from '../../../support/api/api-enums';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import { ApiActions } from '../../../support/api/api-actions';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Error Handling', () => {
  let testPermitId: string;

  afterEach(() => {
    // Clean up test permit if created
    if (testPermitId) {
      ApiActions.deletePermit(testPermitId);
    }
  });

  it('should handle update server errors gracefully', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Set up API intercept to simulate server error using new enum-based API
        ApiIntercepts.interceptError(
          ApiOperation.UPDATE,
          ApiErrorType.SERVER_ERROR,
          'updateServerError'
        );

        UiActions.updatePermitByIndex(lastRowIndex);
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

        // Verify form data is preserved for retry
        cy.get('[data-testid="input-permit-name"]').should('not.have.value', '');
      });
    });
  });

  it('should handle network connection failures during update', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Set up network error using new enum-based API
        ApiIntercepts.interceptError(
          ApiOperation.UPDATE,
          ApiErrorType.NETWORK_ERROR,
          'updateNetworkError'
        );

        UiActions.updatePermitByIndex(lastRowIndex);
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
  });

  it('should handle timeout errors during update operations', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Set up timeout error using loading intercept API
        ApiIntercepts.interceptLoading(
          ApiOperation.UPDATE,
          ApiLoadingType.TIMEOUT,
          'updateTimeout'
        );

        UiActions.updatePermitByIndex(lastRowIndex);
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
        );
        UiActions.clickSubmitButton();

        // Wait for timeout error
        cy.wait('@updateTimeout');

        // Verify system handles timeout gracefully
        cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
          'exist'
        );

        // Verify user can retry the operation
        UiAssertions.verifySubmitButtonEnabled();
      });
    });
  });

  it('should preserve form state during multiple error scenarios', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Set up server error
        ApiIntercepts.interceptError(
          ApiOperation.UPDATE,
          ApiErrorType.SERVER_ERROR,
          'updateError1'
        );

        UiActions.updatePermitByIndex(lastRowIndex);
        
        // Fill form with specific test data
        const testData = {
          permitName: 'Test Error Recovery',
          applicantName: 'Error Test Applicant',
          permitType: 'Error Test Type'
        };

        UiActions.clearPermitForm();
        cy.get('[data-testid="input-permit-name"]').type(testData.permitName);
        cy.get('[data-testid="input-applicant-name"]').type(testData.applicantName);
        cy.get('[data-testid="input-permit-type"]').type(testData.permitType);
        cy.get('[data-testid="input-permit-status"]').select('PENDING');

        UiActions.clickSubmitButton();
        cy.wait('@updateError1');

        // Verify form data is preserved after first error
        cy.get('[data-testid="input-permit-name"]').should(
          'have.value',
          testData.permitName
        );
        cy.get('[data-testid="input-applicant-name"]').should(
          'have.value',
          testData.applicantName
        );
        cy.get('[data-testid="input-permit-type"]').should(
          'have.value',
          testData.permitType
        );

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
        cy.get('[data-testid="input-permit-name"]').should(
          'have.value',
          testData.permitName
        );
        cy.get('[data-testid="input-applicant-name"]').should(
          'have.value',
          testData.applicantName
        );
      });
    });
  });
});