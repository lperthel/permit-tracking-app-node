/*
 * Shared test setup utilities for update permit tests
 */

import { PermitFixtureKeys } from '../../fixtures/permits/permit-fixtures';
import { ApiActions } from '../api/api-actions';
import { UiActions } from '../ui/ui-actions';

export class PermitUpdateTestSetup {
  /**
   * Creates a test permit and sets up the update modal
   */
  static setupModalForUpdate(
    fixtureKey: PermitFixtureKeys = PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE,
    permitIndex = 0
  ): Cypress.Chainable<string> {
    return ApiActions.createPermitFromFixture(fixtureKey).then((permitId) => {
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page where new permits are added
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      if (permitIndex === -1) {
        // Use last row index for newly created permits
        UiActions.getLastRowIndex().then((lastRowIndex) => {
          UiActions.updatePermitByIndex(lastRowIndex);
        });
      } else {
        UiActions.updatePermitByIndex(permitIndex);
      }

      return cy.wrap(permitId);
    });
  }

  /**
   * Teardown method for afterEach hooks
   * Safely deletes test permit if it was created
   */
  static teardown(permitId: string | undefined): void {
    if (permitId) {
      // Use deletePermit which already handles errors gracefully
      ApiActions.deletePermit(permitId);
      cy.log(`Cleaning up test permit: ${permitId}`);
    }
  }

  /**
   * Complete setup with navigation and modal ready for testing
   */
  static setupWithTestPermit(
    fixtureKey: PermitFixtureKeys = PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
  ): Cypress.Chainable<string> {
    return this.setupModalForUpdate(fixtureKey, -1);
  }
}
