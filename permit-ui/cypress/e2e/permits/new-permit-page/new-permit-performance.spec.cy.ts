// ============================================================================
// new-permit-performance.spec.cy.ts - Performance testing for permit creation
// ============================================================================

import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('New Permit Performance', () => {
  describe('Create Permit Performance', () => {
    it('should complete permit creation within acceptable time limits', () => {
      const startTime = Date.now();

      UiActions.visitPermitsPage();
      UiActions.clickNewPermitButton();
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
      UiActions.clickSubmitButton();

      // Wait for creation to complete
      cy.wait(1000);
      UiActions.navigateToPage('last');

      // Find the last row and verify the permit was created there
      UiAssertions.verifyFixturePermitInLastRow(
        PermitFixtureKeys.CREATE_THIS_PERMIT
      );

      // Verify operation completed within reasonable timeframe (< 5 seconds)
      cy.then(() => {
        const duration = Date.now() - startTime;
        expect(duration).to.be.lessThan(5000);
      });
    });
  });
});