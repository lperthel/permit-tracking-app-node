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
    permitIndex: number = 0
  ): Cypress.Chainable<string> {
    return ApiActions.createPermitFromFixture(fixtureKey).then((permitId) => {
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
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
   * Sets up update modal with existing permit (no API creation)
   */
  static setupExistingPermitModal(permitIndex: number = 0): void {
    UiActions.visitPermitsPage();
    UiActions.waitForTableLoad();
    UiActions.updatePermitByIndex(permitIndex);
  }

  /**
   * Standard cleanup for test permits
   */
  static cleanupTestPermit(permitId: string): void {
    if (permitId) {
      ApiActions.deletePermit(permitId);
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