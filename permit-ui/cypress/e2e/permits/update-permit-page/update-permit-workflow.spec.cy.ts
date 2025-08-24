/*
 * Tests core update permit workflow including form pre-population,
 * data modification, and persistence to backend.
 */

import {
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../../../fixtures/permits/permit-fixtures';
import { ApiActions } from '../../../support/api/api-actions';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Core Workflow', () => {
  let testPermitId: string;

  afterEach(() => {
    // Clean up test permit if created
    if (testPermitId) {
      ApiActions.deletePermit(testPermitId);
    }
  });

  it('should update permit data and reflect changes in table', () => {
    // Setup: Create test permit via API
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Navigate to permits page and refresh data
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Find the test permit in the last row using improved method
      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Verify original permit data before update
        UiAssertions.verifyFixturePermitInTable(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE,
          lastRowIndex
        );

        // Open update modal using improved method
        UiActions.updatePermitByIndex(lastRowIndex);

        // Verify update modal opened with correct title
        cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
          'contain.text',
          PERMIT_FORM_HEADERS.updatePermit
        );

        // Verify form is pre-populated with existing data
        PermitFixtures.getPermitFormData(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
        ).then((beforeData) => {
          UiAssertions.verifyPermitFormData({
            permitName: beforeData.permitName,
            applicantName: beforeData.applicantName,
            permitType: beforeData.permitType,
            status: beforeData.status as any,
          });

          // Update form with new data from fixtures
          UiActions.fillPermitFormFromFixture(
            PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
          );

          // Submit the updated form
          UiActions.clickSubmitButton();
          cy.wait(1000);

          // Refresh and verify the update
          UiActions.clickRefreshButton();
          UiActions.waitForTableLoad();

          // Verify changes in the last row
          UiActions.getLastRowIndex().then((updatedLastRowIndex) => {
            UiAssertions.verifyFixturePermitInTable(
              PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER,
              updatedLastRowIndex
            );
          });
        });
      });
    });
  });

  it('should preserve unchanged fields during partial updates', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Find the newly created permit using improved method
      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Open update modal
        UiActions.updatePermitByIndex(lastRowIndex);

        // Modify only the permit name, leave other fields unchanged
        UiActions.clearFormField('permitName');
        cy.get('[data-testid="input-permit-name"]').type(
          'Partially Updated Permit'
        );

        // Submit the update
        UiActions.clickSubmitButton();
        cy.wait(1000);

        // Verify only permit name changed, other fields preserved
        UiActions.clickRefreshButton();
        UiActions.waitForTableLoad();

        PermitFixtures.getPermitFormData(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
        ).then((originalData) => {
          UiActions.getLastRowIndex().then((updatedLastRowIndex) => {
            UiAssertions.verifyPermitInTable(
              {
                permitName: 'Partially Updated Permit',
                applicantName: originalData.applicantName, // Should be unchanged
                permitType: originalData.permitType, // Should be unchanged
                status: originalData.status as any, // Should be unchanged
              },
              updatedLastRowIndex
            );
          });
        });
      });
    });
  });

  it('should handle form pre-population correctly', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Open update modal
        UiActions.updatePermitByIndex(lastRowIndex);

        // Verify form is pre-populated with existing data
        PermitFixtures.getPermitFormData(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
        ).then((expectedData) => {
          UiAssertions.verifyPermitFormData({
            permitName: expectedData.permitName,
            applicantName: expectedData.applicantName,
            permitType: expectedData.permitType,
            status: expectedData.status as any,
          });
        });

        // Close modal without saving
        UiActions.clickModalCloseButton();
        
        // Verify main page is visible
        UiAssertions.verifyMainPageVisible();
      });
    });
  });
});