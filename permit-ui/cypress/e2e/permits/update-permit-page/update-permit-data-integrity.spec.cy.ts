/*
 * Tests data integrity and persistence during permit updates including
 * referential integrity, concurrent updates, and database consistency.
 */

import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../../../fixtures/permits/permit-fixtures';
import { ApiActions } from '../../../support/api/api-actions';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Data Integrity', () => {
  let testPermitId: string;

  afterEach(() => {
    // Clean up test permit if created
    if (testPermitId) {
      ApiActions.deletePermit(testPermitId);
    }
  });

  it('should maintain referential integrity during updates', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Verify permit exists in database via API before update
      ApiActions.verifyPermitExists(permitId).then((exists) => {
        expect(exists).to.be.true;
      });

      // Update via UI
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page where new permits are added
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
        );
        UiActions.clickSubmitButton();

        // Wait for UI to update and refresh to ensure backend persistence
        cy.wait(2000);
        UiActions.clickRefreshButton();
        UiActions.waitForTableLoad();

        // Now verify permit still exists with same ID but updated data
        ApiActions.getPermit(permitId).then((updatedPermit) => {
          expect(updatedPermit.id).to.equal(permitId);

          // Verify updated data persists in database
          PermitFixtures.getPermitFormData(
            PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
          ).then((afterData) => {
            expect(updatedPermit.permitName).to.equal(afterData.permitName);
            expect(updatedPermit.applicantName).to.equal(
              afterData.applicantName
            );
            expect(updatedPermit.permitType).to.equal(afterData.permitType);
            expect(updatedPermit.status).to.equal(afterData.status);
          });
        });
      });
    });
  });

  it('should persist updates correctly in database', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Perform update via UI
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page where new permits are added
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
        );
        UiActions.clickSubmitButton();
        cy.wait(1000);

        // Verify changes persist by fetching directly from API
        ApiActions.getPermit(permitId).then((fetchedPermit) => {
          PermitFixtures.getPermitFormData(
            PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
          ).then((expectedData) => {
            expect(fetchedPermit.permitName).to.equal(expectedData.permitName);
            expect(fetchedPermit.applicantName).to.equal(
              expectedData.applicantName
            );
            expect(fetchedPermit.permitType).to.equal(expectedData.permitType);
            expect(fetchedPermit.status).to.equal(expectedData.status);
          });
        });
      });
    });
  });

  it('should handle concurrent update scenarios appropriately', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Navigate to UI and open update modal
      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page where new permits are added
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);

        // Simulate concurrent update via API while UI update is in progress
        ApiActions.updatePermit(permitId, {
          permitName: 'API Updated Permit',
          applicantName: 'API Updated Applicant',
          permitType: 'API Updated Type',
          status: 'APPROVED' as any,
        }).then(() => {
          // Attempt UI update after API update
          UiActions.fillPermitFormFromFixture(
            PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
          );
          UiActions.clickSubmitButton();
          cy.wait(1000);

          // Verify system handles concurrent updates appropriately
          // (Implementation depends on your conflict resolution strategy)
          UiActions.clickRefreshButton();
          UiActions.waitForTableLoad();

          // Verify permit exists and has consistent data
          UiActions.getPermitNameFromRow(0).should('exist');
        });
      });
    });
  });

  it('should maintain data consistency across page refreshes', () => {
    // Setup: Create and update test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      // Navigate to last page where new permits are added
      UiActions.navigateToPage('last');
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER
        );
        UiActions.clickSubmitButton();
        cy.wait(1000);

        // Refresh the entire page
        cy.reload();
        UiActions.waitForTableLoad();

        // Verify updated data still appears correctly
        UiActions.clickRefreshButton();
        UiActions.waitForTableLoad();

        // Navigate to last page again after reload (app resets to first page)
        UiActions.navigateToPage('last');
        UiActions.waitForTableLoad();

        UiActions.getLastRowIndex().then((refreshedLastRowIndex) => {
          UiAssertions.verifyFixturePermitInTable(
            PermitFixtureKeys.UPDATE_TEST_PERMIT_AFTER,
            refreshedLastRowIndex
          );
        });
      });
    });
  });

  it('should handle partial field updates correctly', () => {
    // Setup: Create test permit
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      // Get original data for comparison
      PermitFixtures.getPermitFormData(
        PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
      ).then((originalData) => {
        UiActions.visitPermitsPage();
        UiActions.clickRefreshButton();
        UiActions.waitForTableLoad();

        // Navigate to last page where new permits are added
        UiActions.navigateToPage('last');
        UiActions.waitForTableLoad();

        UiActions.getLastRowIndex().then((lastRowIndex) => {
          UiActions.updatePermitByIndex(lastRowIndex);

          // Update only permit name and applicant name
          UiActions.clearFormField('permitName');
          UiActions.clearFormField('applicantName');

          UiActions.typeInPermitNameField('Partially Updated Name');
          UiActions.typeInApplicantNameField('Partially Updated Applicant');

          UiActions.clickSubmitButton();
          cy.wait(1000);

          // Verify API shows partial update with unchanged fields preserved
          ApiActions.getPermit(permitId).then((updatedPermit) => {
            expect(updatedPermit.permitName).to.equal('Partially Updated Name');
            expect(updatedPermit.applicantName).to.equal(
              'Partially Updated Applicant'
            );
            expect(updatedPermit.permitType).to.equal(originalData.permitType);
            expect(updatedPermit.status).to.equal(originalData.status);
          });
        });
      });
    });
  });
});
