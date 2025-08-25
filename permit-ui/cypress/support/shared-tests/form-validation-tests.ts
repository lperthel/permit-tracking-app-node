// ============================================================================
// form-validation-tests.ts - Shared validation testing utilities
// ============================================================================

import { PermitFixtureKeys } from '../../fixtures/permits/permit-fixtures';
import { PERMIT_FORM_ERRORS } from '../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../src/app/permits/shared/models/permit-status.enums';
import { UiActions } from '../ui/ui-actions';
import { UiAssertions } from '../ui/ui-assertions';

/**
 * Shared validation tests for permit-form component
 * Since both new-permit and update-permit pages use the same PermitFormComponent,
 * we can share the validation testing logic while still testing each context.
 */
export class FormValidationTests {
  /**
   * Test all required field validations
   * Works for both create and update contexts
   */
  static testRequiredFieldValidations(): void {
    // Clear form and submit to trigger validation
    UiActions.clearPermitForm();
    UiActions.clickSubmitButton();

    // Verify all required field errors appear
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
  }

  /**
   * Test permit name validation scenarios
   */
  static testPermitNameValidation(): void {
    // Test required field
    UiActions.clearFormField('permitName');
    UiActions.clickSubmitButton();
    UiAssertions.verifyFormError(
      'permitName',
      PERMIT_FORM_ERRORS.invalidPermitName
    );

    // Test valid name clears error
    UiActions.typeInPermitNameField('Valid Permit Name');
    UiAssertions.verifyNoPermitFormError('permitName');
  }

  /**
   * Test applicant name validation scenarios
   */
  static testApplicantNameValidation(): void {
    // Test required field
    UiActions.clearFormField('applicantName');
    UiActions.clickSubmitButton();
    UiAssertions.verifyFormError(
      'applicantName',
      PERMIT_FORM_ERRORS.invalidApplicantName
    );

    // Test valid name clears error
    UiActions.typeInApplicantNameField('Valid Applicant Name');
    UiAssertions.verifyNoPermitFormError('applicantName');
  }

  /**
   * Test permit type validation scenarios
   */
  static testPermitTypeValidation(): void {
    // Test required field
    UiActions.clearFormField('permitType');
    UiActions.clickSubmitButton();
    UiAssertions.verifyFormError(
      'permitType',
      PERMIT_FORM_ERRORS.invalidPermitType
    );

    // Test valid type clears error
    UiActions.typeInPermitTypeField('Construction');
    UiAssertions.verifyNoPermitFormError('permitType');
  }

  /**
   * Test status validation scenarios
   */
  static testStatusValidation(): void {
    // Test all valid status values
    const validStatuses = [
      PermitStatus.SUBMITTED,
      PermitStatus.PENDING,
      PermitStatus.UNDER_REVIEW,
      PermitStatus.APPROVED,
      PermitStatus.REJECTED,
      PermitStatus.EXPIRED,
    ];

    validStatuses.forEach((status) => {
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
      UiActions.selectStatus(status);
      UiAssertions.verifyNoPermitFormError('status');
      UiActions.clearPermitForm();
    });
  }

  /**
   * Test form validation error clearing when fields are corrected
   */
  static testErrorClearing(): void {
    // Trigger all validation errors
    UiActions.clearPermitForm();
    UiActions.clickSubmitButton();

    // Verify errors exist
    UiAssertions.verifyFormError('permitName');
    UiAssertions.verifyFormError('applicantName');
    UiAssertions.verifyFormError('permitType');
    UiAssertions.verifyFormError('status');

    // Fill valid form data and verify errors clear
    UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
    UiAssertions.verifyNoPermitFormErrors();
  }

  /**
   * Run complete validation test suite
   * Call this from either new-permit or update-permit validation tests
   */
  static runCompleteValidationSuite(): void {
    describe('Required Field Validation', () => {
      it('should show validation errors for all required fields when form is empty', () => {
        this.testRequiredFieldValidations();
      });
    });

    describe('Permit Name Validation', () => {
      it('should validate permit name field', () => {
        this.testPermitNameValidation();
      });
    });

    describe('Applicant Name Validation', () => {
      it('should validate applicant name field', () => {
        this.testApplicantNameValidation();
      });
    });

    describe('Permit Type Validation', () => {
      it('should validate permit type field', () => {
        this.testPermitTypeValidation();
      });
    });

    describe('Status Validation', () => {
      it('should accept all valid status values', () => {
        this.testStatusValidation();
      });
    });

    describe('Error Clearing', () => {
      it('should clear validation errors when valid data is entered', () => {
        this.testErrorClearing();
      });
    });
  }
}
