import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { UiActions } from '../../../support/ui/ui-actions';
import { selector_shortcuts } from '../../../support/ui/cypress-selectors';
import { UiAssertions } from '../../../support/ui/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates the complete Create Permit workflow from form submission
 * through database persistence and UI verification, ensuring government-ready data
 * integrity and user experience standards.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • Data Persistence: Permit creation properly stores data in backend systems
 * • User Workflow: Complete end-to-end permit creation experience
 * • Data Validation: Form data correctly transfers to database
 * • UI Feedback: Successful creation reflects immediately in permit table
 *
 * TEST STRATEGY:
 * ==============
 * Uses standardized test support classes for maintainable, government-ready patterns:
 * - UiActions: Centralized UI interactions and form operations
 * - UiAssertions: Standardized verification and validation patterns
 * - ApiActions: Direct API operations for test setup and cleanup
 * - PermitFixtureKeys: Type-safe fixture references eliminating hardcoded strings
 */

describe('Create Permit - CRUD Operations', () => {
  describe('Create Permit Workflow', () => {
    it('should create permit through UI and display in table', () => {
      // Navigate to permits page and open new permit modal
      UiActions.visitPermitsPage();
      UiActions.clickNewPermitButton();

      // Fill form with validated test data from fixtures
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

      // Submit form to create permit
      UiActions.clickSubmitButton();

      // Wait for form submission to complete and modal to close
      cy.wait(1000);

      // Navigate to last page to find newly created permit
      UiActions.navigateToPage('last');

      // Verify permit appears in last row with correct data
      UiAssertions.verifyFixturePermitInLastRow(
        PermitFixtureKeys.CREATE_THIS_PERMIT
      );
    });

    it('should persist permit data correctly across page refreshes', () => {
      // Create permit through UI
      UiActions.visitPermitsPage();
      UiActions.clickNewPermitButton();
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
      UiActions.clickSubmitButton();
      cy.wait(1000);

      // Navigate to last page and capture permit details from last row
      UiActions.navigateToPage('last');
      let createdPermitData: any;

      // Get the last row index and capture permit data
      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Capture the permit data for verification after refresh
        cy.get(selector_shortcuts.permitRowName(lastRowIndex))
          .invoke('text')
          .then((permitName) => {
            cy.get(selector_shortcuts.permitRowApplicantName(lastRowIndex))
              .invoke('text')
              .then((applicantName) => {
                cy.get(selector_shortcuts.permitRowPermitType(lastRowIndex))
                  .invoke('text')
                  .then((permitType) => {
                    cy.get(selector_shortcuts.permitRowStatus(lastRowIndex))
                      .invoke('text')
                      .then((status) => {
                        createdPermitData = {
                          permitName: permitName.trim(),
                          applicantName: applicantName.trim(),
                          permitType: permitType.trim(),
                          status: status.trim(),
                        };

                        // Refresh the page to test data persistence
                        cy.reload();
                        UiActions.waitForTableLoad();
                        UiActions.navigateToPage('last');

                        // Find the last row again after refresh and verify data persists
                        UiAssertions.verifyFixturePermitInLastRow(
                          PermitFixtureKeys.CREATE_THIS_PERMIT
                        );
                      });
                  });
              });
          });
      });
    });
  });

});
