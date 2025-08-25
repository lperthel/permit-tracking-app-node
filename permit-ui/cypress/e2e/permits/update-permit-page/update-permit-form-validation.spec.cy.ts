import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../../src/app/permits/shared/models/permit-status.enums';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { FormValidationTests } from '../../../support/shared-tests/form-validation-tests';
import { PermitUpdateTestSetup } from '../../../support/test-setup/permit-update-test-setup';
import { UiActions } from '../../../support/ui/ui-actions';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiAssertions } from '../../../support/ui/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates form validation behavior for the Update Permit modal,
 * ensuring consistent validation rules with the New Permit modal since both use
 * the same PermitFormComponent.
 *
 * TEST STRATEGY:
 * ==============
 * Uses shared FormValidationTests class to avoid duplication with new-permit tests:
 * - FormValidationTests: Shared validation logic for permit forms
 * - PermitUpdateTestSetup: Setup utilities for update permit tests
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 */

describe('Update Permit - Form Validation', () => {
  let testPermitId: string | undefined;

  beforeEach(() => {
    // Create a test permit and open the update modal
    PermitUpdateTestSetup.setupWithTestPermit(
      PermitFixtureKeys.UPDATE_TEST_PERMIT_BEFORE
    ).then((permitId) => {
      testPermitId = permitId;
      // Modal should now be open and ready for validation testing
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
    });
  });

  afterEach(() => {
    // Clean up test permit
    PermitUpdateTestSetup.teardown(testPermitId);
    testPermitId = undefined;
  });

  describe('Form Validation - Required Fields', () => {
    it('should validate all required fields when cleared and submitted', () => {
      FormValidationTests.testRequiredFieldValidations();
    });

    it('should clear validation errors when valid data is entered', () => {
      FormValidationTests.testErrorClearing();
    });
  });

  describe('Form Validation - Field-Specific Rules', () => {
    describe('Permit Name Validation', () => {
      it('should validate permit name field correctly', () => {
        FormValidationTests.testPermitNameValidation();
      });
    });

    describe('Applicant Name Validation', () => {
      it('should validate applicant name field correctly', () => {
        FormValidationTests.testApplicantNameValidation();
      });
    });

    describe('Permit Type Validation', () => {
      it('should validate permit type field correctly', () => {
        FormValidationTests.testPermitTypeValidation();
      });
    });

    describe('Status Field Validation', () => {
      it('should accept all valid status values', () => {
        FormValidationTests.testStatusValidation();
      });

      it('should display all available status options in dropdown', () => {
        UiAssertions.verifyStatusDropdownOptions([
          PermitStatus.SUBMITTED,
          PermitStatus.PENDING,
          PermitStatus.UNDER_REVIEW,
          PermitStatus.APPROVED,
          PermitStatus.REJECTED,
          PermitStatus.EXPIRED,
        ]);
      });
    });
  });

  describe('Update-Specific Validation', () => {
    it('should preserve existing data when opening update modal', () => {
      // This test is specific to update functionality
      // Verify form is pre-populated with existing permit data
      UiAssertions.verifyPermitFormData({
        permitName: 'Update this Permit',
        applicantName: 'This is a Permit added by a cypress integration Test that needs to be updated',
        permitType: 'Construction',
        status: PermitStatus.PENDING,
      });
    });

    it('should validate changes to existing data', () => {
      // Clear a required field and verify validation
      UiActions.clearFormField('permitName');
      UiActions.clickSubmitButton();
      UiAssertions.verifyFormError('permitName', PERMIT_FORM_ERRORS.invalidPermitName);
      
      // Enter valid data and verify error clears
      UiActions.typeInPermitNameField('Updated Permit Name');
      UiAssertions.verifyNoPermitFormError('permitName');
    });
  });
});