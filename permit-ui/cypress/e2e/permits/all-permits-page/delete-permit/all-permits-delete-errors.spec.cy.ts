import { AllPermitsComponentConstants } from '../../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PermitFixtureKeys } from '../../../../fixtures/permits/permit-fixtures';
import { ApiActions } from '../../../../support/api/api-actions';
import {
  ApiErrorType,
  ApiLoadingType,
  ApiOperation,
} from '../../../../support/api/api-enums';
import { ApiIntercepts } from '../../../../support/api/api-intercepts';
import { UiActions } from '../../../../support/ui/ui-actions';
import { UiAssertions } from '../../../../support/ui/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates that the All Permits page handles delete operation failures gracefully,
 * ensuring government users receive clear error messaging and can recover from failed delete operations
 * without losing data or application functionality.
 *
 * REQUIREMENTS TESTED:
 * ===============================
 * • Data Protection: Failed deletes don't corrupt permit data or application state
 * • User Experience: Clear error messaging for delete operation failures
 * • Resilience: Application remains functional after delete operation errors
 * • Error Recovery: Users can retry failed operations or continue with other tasks
 *
 */

describe('All Permits Page - Delete Operation Error Scenarios', () => {
  let testPermitIds: string[] = [];

  beforeEach(() => {
    testPermitIds = [];
    UiActions.visitPermitsPage();
  });

  it('should display error message when delete operation fails with server error', () => {
    // Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.DELETE_TEST_PERMIT
    ).then((permitId) => {
      testPermitIds.push(permitId);

      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Get permit name for verification
      UiActions.getPermitNameFromRow(0).then((permitName) => {
        // Set up delete error using new enum-based API
        ApiIntercepts.interceptError(
          ApiOperation.DELETE,
          ApiErrorType.SERVER_ERROR,
          'deleteServerError'
        );

        // Delete first permit
        UiActions.deletePermitByIndex(0);
        cy.wait('@deleteServerError');

        // Verify error and permit still exists
        UiAssertions.verifyAllPermitsErrorMessage('Could not delete');
        cy.contains('td', permitName).should('exist');

        UiAssertions.verifyButtonEnabled(
          `[data-testid="${AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON}"]`
        );
      });
    });
  });

  it('should handle delete request timeout gracefully', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.TIMEOUT_TEST_PERMIT
    ).then((permitId) => {
      testPermitIds.push(permitId);

      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      const DELETE_BUTTON_SELECTOR = `[data-testid="${AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(
        0
      )}"]`;
      const DELETING_BUTTON_TEXT =
        AllPermitsComponentConstants.UI_TEXT.DELETING_BUTTON;
      const DELETE_BUTTON_TEXT =
        AllPermitsComponentConstants.UI_TEXT.DELETE_BUTTON;

      // Set up loading intercept using new enum-based API
      ApiIntercepts.interceptLoading(
        ApiOperation.DELETE,
        ApiLoadingType.SLOW,
        'deleteTimeout'
      );

      // Verify initial state and trigger delete
      cy.get(DELETE_BUTTON_SELECTOR)
        .should('not.be.disabled')
        .and('contain.text', DELETE_BUTTON_TEXT);

      UiActions.deletePermitByIndex(0);

      // Verify loading state
      cy.get(DELETE_BUTTON_SELECTOR)
        .should('be.disabled')
        .and('contain.text', DELETING_BUTTON_TEXT);

      // Verify other UI elements remain functional
      cy.get(
        `[data-testid="${AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE}"]`
      ).should('be.visible');
      cy.get(
        `[data-testid="${AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON}"]`
      ).should('be.visible');

      // Verify other delete buttons still work (if there are multiple permits)
      UiActions.getPermitCount().then((count) => {
        if (count > 1) {
          cy.get(
            `[data-testid="${AllPermitsComponentConstants.TEST_IDS.DELETE_PERMIT_BUTTON(
              1
            )}"]`
          )
            .should('not.be.disabled')
            .and('contain.text', DELETE_BUTTON_TEXT);
        }
      });
    });
  });

  it('should display error message when delete receives network connection failure', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.DELETE_TEST_PERMIT
    ).then((permitId) => {
      testPermitIds.push(permitId);

      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Get permit name for verification
      UiActions.getPermitNameFromRow(0).then((permitName) => {
        // Set up network error using new enum-based API
        ApiIntercepts.interceptError(
          ApiOperation.DELETE,
          ApiErrorType.NETWORK_ERROR,
          'deleteNetworkError'
        );

        // Delete first permit
        UiActions.deletePermitByIndex(0);
        cy.wait('@deleteNetworkError');

        // Verify error handling and data restoration
        UiAssertions.verifyAllPermitsErrorMessage('Could not delete');
        cy.contains('td', permitName).should('exist');

        // Verify app remains functional
        UiAssertions.verifyButtonEnabled(
          `[data-testid="${AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON}"]`
        );
      });
    });
  });

  it('should handle multiple consecutive delete failures gracefully', () => {
    // Create two test permits
    const permit1 = ApiActions.createPermitFromFixture(
      PermitFixtureKeys.DELETE_TEST_PERMIT
    );
    const permit2 = ApiActions.createPermitFromFixture(
      PermitFixtureKeys.ERROR_SCENARIO_PERMIT
    );

    Promise.all([permit1, permit2]).then((permitIds) => {
      testPermitIds.push(...permitIds);

      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Set up delete error for all requests using new enum-based API
      ApiIntercepts.interceptError(
        ApiOperation.DELETE,
        ApiErrorType.SERVER_ERROR,
        'deleteFailure'
      );

      // Delete first permit
      UiActions.deletePermitByIndex(0);
      cy.wait('@deleteFailure');
      UiAssertions.verifyAllPermitsErrorMessage('Could not delete');

      // Delete second permit
      UiActions.deletePermitByIndex(1);
      cy.wait('@deleteFailure');

      // Verify error shows both failures
      UiAssertions.verifyAllPermitsErrorMessage('Could not delete 2 permits:');

      UiAssertions.verifyButtonEnabled(
        `[data-testid="${AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON}"]`
      );
    });
  });
});
