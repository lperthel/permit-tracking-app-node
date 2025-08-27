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
import { PermitUpdateTestSetup } from '../../../support/test-setup/permit-update-test-setup';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Core Workflow', () => {
  let testPermitId: string | undefined;

  afterEach(() => {
    // Clean up test permit if created using teardown method
    PermitUpdateTestSetup.teardown(testPermitId);
    testPermitId = undefined; // Reset for next test
  });

  it('should update permit data and reflect changes in table', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Find the test permit in the last row
      UiActions.getLastRowIndex().then((lastRowIndex) => {
        // Verify original permit data before update
        UiAssertions.verifyFixturePermitInTable(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE,
          lastRowIndex
        );

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

          // Navigate to last page to find the updated permit
          UiActions.navigateToPage('last');
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
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Modify only the permit name, leave other fields unchanged
      UiActions.clearFormField('permitName');
      UiActions.typeInPermitNameField('Partially Updated Permit');

      // Submit the update
      UiActions.clickSubmitButton();
      cy.wait(1000);

      // Verify only permit name changed, other fields preserved
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page to find the updated permit
      UiActions.navigateToPage('last');
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

  it('should handle form pre-population correctly', () => {
    // Setup: Create test permit and open update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

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

        // Close modal without saving
        UiActions.clickModalCloseButton();

        // Verify main page is visible
        UiAssertions.verifyMainPageVisible();
      });
    });
  });
});
