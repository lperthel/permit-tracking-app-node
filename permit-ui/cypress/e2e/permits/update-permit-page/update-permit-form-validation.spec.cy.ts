/*
 * Tests form validation during permit updates including required fields,
 * accessibility, and error state preservation.
 */

import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { ApiActions } from '../../../support/api/api-actions';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

describe('Update Permit - Form Validation', () => {
  let testPermitId: string;

  afterEach(() => {
    if (testPermitId) {
      ApiActions.deletePermit(testPermitId);
    }
  });

  it('should validate all required fields when cleared and submitted', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);

        // Clear all required fields to trigger validation
        UiActions.clearPermitForm();
        UiActions.clickSubmitButton();

        // Verify validation errors appear for all required fields
        UiAssertions.verifyFormError(
          'permitName',
          PERMIT_FORM_ERRORS.invalidPermitName
        );
        UiAssertions.verifyFormError(
          'applicantName',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );
        UiAssertions.verifyFormError(
          'permitType',
          PERMIT_FORM_ERRORS.invalidPermitType
        );
        UiAssertions.verifyFormError('status', PERMIT_FORM_ERRORS.invalidStatus);

        // Verify modal remains open for correction
        cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
          'exist'
        );
      });
    });
  });

  it('should validate individual required fields', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);

        // Test permit name validation
        UiActions.clearFormField('permitName');
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError('permitName');

        // Fill permit name and verify error clears
        cy.get('[data-testid="input-permit-name"]').type('Valid Permit Name');
        UiAssertions.verifyNoPermitFormError('permitName');

        // Test applicant name validation
        UiActions.clearFormField('applicantName');
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError('applicantName');

        // Fill applicant name and verify error clears
        cy.get('[data-testid="input-applicant-name"]').type('Valid Applicant');
        UiAssertions.verifyNoPermitFormError('applicantName');
      });
    });
  });

  it('should maintain accessibility during validation', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);

        // Verify form has proper ARIA attributes
        UiAssertions.verifyAriaLabels();
        UiAssertions.verifyFormAccessibility();

        // Clear fields to trigger validation
        UiActions.clearPermitForm();
        UiActions.clickSubmitButton();

        // Verify validation errors have proper accessibility attributes
        UiAssertions.verifyValidationErrorAccessibility();
      });
    });
  });

  it('should preserve form data after validation errors', () => {
    ApiActions.createPermitFromFixture(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;

      UiActions.visitPermitsPage();
      UiActions.clickRefreshButton();
      UiActions.waitForTableLoad();

      UiActions.getLastRowIndex().then((lastRowIndex) => {
        UiActions.updatePermitByIndex(lastRowIndex);

        // Partially fill form with valid data
        cy.get('[data-testid="input-permit-name"]').clear().type('Valid Name');
        cy.get('[data-testid="input-applicant-name"]')
          .clear()
          .type('Valid Applicant');

        // Leave other fields empty and submit
        UiActions.clearFormField('permitType');
        UiActions.clearFormField('status');
        UiActions.clickSubmitButton();

        // Verify validation errors for empty fields
        UiAssertions.verifyFormError('permitType');
        UiAssertions.verifyFormError('status');

        // Verify previously filled data is preserved
        cy.get('[data-testid="input-permit-name"]').should(
          'have.value',
          'Valid Name'
        );
        cy.get('[data-testid="input-applicant-name"]').should(
          'have.value',
          'Valid Applicant'
        );
      });
    });
  });
});