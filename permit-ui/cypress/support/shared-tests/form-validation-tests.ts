// ============================================================================
// form-validation-tests.ts - Shared validation testing utilities
// ============================================================================

import { PermitFixtureKeys } from '../../fixtures/permits/permit-fixtures';
import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_CONSTRAINTS,
} from '../../../src/app/permits/permit-form-model/permit-form.constants';
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
    // Test empty form submission
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

    // Test that filling valid data clears all errors
    UiActions.fillPermitForm(
      'Valid Permit Name',
      'Valid Applicant',
      'Valid Type',
      PermitStatus.PENDING
    );
    UiAssertions.verifyNoPermitFormErrors();

    // Test each required field individually by leaving only one empty
    const requiredFieldTests = [
      {
        field: 'permitName' as const,
        permitName: '',
        applicantName: 'Valid Applicant',
        permitType: 'Valid Type',
        status: PermitStatus.PENDING,
        error: PERMIT_FORM_ERRORS.invalidPermitName
      },
      {
        field: 'applicantName' as const,
        permitName: 'Valid Permit',
        applicantName: '',
        permitType: 'Valid Type',
        status: PermitStatus.PENDING,
        error: PERMIT_FORM_ERRORS.invalidApplicantName
      },
      {
        field: 'permitType' as const,
        permitName: 'Valid Permit',
        applicantName: 'Valid Applicant',
        permitType: '',
        status: PermitStatus.PENDING,
        error: PERMIT_FORM_ERRORS.invalidPermitType
      },
      {
        field: 'status' as const,
        permitName: 'Valid Permit',
        applicantName: 'Valid Applicant',
        permitType: 'Valid Type',
        status: '' as any,
        error: PERMIT_FORM_ERRORS.invalidStatus
      }
    ];

    requiredFieldTests.forEach(({ field, permitName, applicantName, permitType, status, error }) => {
      UiActions.fillPermitForm(permitName, applicantName, permitType, status);
      UiActions.clickSubmitButton();
      UiAssertions.verifyFormError(field, error);
    });
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
   * Test permit name at exactly max length characters
   */
  static testPermitNameBoundaryAccept(): void {
    const exactlyMaxChars = 'A'.repeat(
      PERMIT_FORM_CONSTRAINTS.permitNameMaxLength
    );

    UiActions.fillPermitForm(
      exactlyMaxChars,
      'Valid Applicant',
      'Valid Type',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should not show validation error for permit name
    UiAssertions.verifyNoPermitFormError('permitName');
  }

  /**
   * Test permit name exceeding max length characters
   */
  static testPermitNameBoundaryReject(): void {
    const overMaxChars = 'A'.repeat(
      PERMIT_FORM_CONSTRAINTS.permitNameMaxLength + 1
    );

    UiActions.fillPermitForm(
      overMaxChars,
      'Valid Applicant',
      'Valid Type',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should show validation error for permit name
    UiAssertions.verifyFormError(
      'permitName',
      PERMIT_FORM_ERRORS.invalidPermitName
    );
  }

  /**
   * Test applicant name at exactly max length characters
   */
  static testApplicantNameBoundaryAccept(): void {
    const exactlyMaxChars = 'B'.repeat(
      PERMIT_FORM_CONSTRAINTS.applicantNameMaxLength
    );

    UiActions.fillPermitForm(
      'Valid Permit',
      exactlyMaxChars,
      'Valid Type',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should not show validation error for applicant name
    UiAssertions.verifyNoPermitFormError('applicantName');
  }

  /**
   * Test applicant name exceeding max length characters
   */
  static testApplicantNameBoundaryReject(): void {
    const overMaxChars = 'B'.repeat(
      PERMIT_FORM_CONSTRAINTS.applicantNameMaxLength + 1
    );

    UiActions.fillPermitForm(
      'Valid Permit',
      overMaxChars,
      'Valid Type',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should show validation error for applicant name
    UiAssertions.verifyFormError(
      'applicantName',
      PERMIT_FORM_ERRORS.invalidApplicantName
    );
  }

  /**
   * Test permit type at exactly max length characters
   */
  static testPermitTypeBoundaryAccept(): void {
    const exactlyMaxChars = 'C'.repeat(
      PERMIT_FORM_CONSTRAINTS.permitTypeMaxLength
    );

    UiActions.fillPermitForm(
      'Valid Permit',
      'Valid Applicant',
      exactlyMaxChars,
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should not show validation error for permit type
    UiAssertions.verifyNoPermitFormError('permitType');
  }

  /**
   * Test permit type exceeding max length characters
   */
  static testPermitTypeBoundaryReject(): void {
    const overMaxChars = 'C'.repeat(
      PERMIT_FORM_CONSTRAINTS.permitTypeMaxLength + 1
    );

    UiActions.fillPermitForm(
      'Valid Permit',
      'Valid Applicant',
      overMaxChars,
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should show validation error for permit type
    UiAssertions.verifyFormError(
      'permitType',
      PERMIT_FORM_ERRORS.invalidPermitType
    );
  }

  /**
   * Test single character inputs
   */
  static testSingleCharacterInputs(): void {
    UiActions.fillPermitForm(
      'A',
      'B',
      'C',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should accept single character inputs
    UiAssertions.verifyNoPermitFormErrors();
  }

  /**
   * Test whitespace-only inputs
   */
  static testWhitespaceOnlyInputs(): void {
    UiActions.fillPermitForm(
      '   ',
      '   ',
      '   ',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should show validation errors for whitespace-only inputs
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
  }

  /**
   * Test fields with leading and trailing spaces
   */
  static testLeadingTrailingSpaces(): void {
    UiActions.fillPermitForm(
      '  Valid Permit  ',
      '  Valid Applicant  ',
      '  Valid Type  ',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should accept inputs with leading/trailing spaces (trimmed)
    UiAssertions.verifyNoPermitFormErrors();
  }

  /**
   * Test special characters within limits
   */
  static testSpecialCharacters(): void {
    const specialCharsPermit = "Test-Permit's & Co. (2024)";
    const specialCharsApplicant = "O'Connor, Smith & Associates";
    const specialCharsType = 'Commercial-Retail Type';

    UiActions.fillPermitForm(
      specialCharsPermit,
      specialCharsApplicant,
      specialCharsType,
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should accept valid special characters
    UiAssertions.verifyNoPermitFormErrors();
  }

  /**
   * Test Unicode characters within limits
   */
  static testUnicodeCharacters(): void {
    UiActions.fillPermitForm(
      'Café Résumé Naïve Permit',
      'José María González',
      'Bâtiment Commercial',
      PermitStatus.PENDING
    );

    UiActions.clickSubmitButton();

    // Should accept Unicode characters
    UiAssertions.verifyNoPermitFormErrors();
  }

  /**
   * Performance-optimized: Test field boundary for any field
   * Consolidates accept and reject tests in one method
   */
  static testFieldBoundary(
    fieldName: 'permitName' | 'applicantName' | 'permitType',
    maxLength: number
  ): void {
    // Test acceptance at max length
    const exactlyMaxChars = 'A'.repeat(maxLength);
    const overMaxChars = 'A'.repeat(maxLength + 1);

    // First test: should accept at max length
    UiActions.clearPermitForm();

    if (fieldName === 'permitName') {
      UiActions.typeInPermitNameField(exactlyMaxChars);
      UiActions.typeInApplicantNameField('Valid Applicant');
      UiActions.typeInPermitTypeField('Valid Type');
    } else if (fieldName === 'applicantName') {
      UiActions.typeInPermitNameField('Valid Permit');
      UiActions.typeInApplicantNameField(exactlyMaxChars);
      UiActions.typeInPermitTypeField('Valid Type');
    } else {
      UiActions.typeInPermitNameField('Valid Permit');
      UiActions.typeInApplicantNameField('Valid Applicant');
      UiActions.typeInPermitTypeField(exactlyMaxChars);
    }

    UiActions.selectStatus('PENDING');
    UiActions.clickSubmitButton();
    UiAssertions.verifyNoPermitFormError(fieldName);

    // Second test: should reject over max length
    UiActions.clearPermitForm();

    if (fieldName === 'permitName') {
      UiActions.typeInPermitNameField(overMaxChars);
      UiActions.typeInApplicantNameField('Valid Applicant');
      UiActions.typeInPermitTypeField('Valid Type');
    } else if (fieldName === 'applicantName') {
      UiActions.typeInPermitNameField('Valid Permit');
      UiActions.typeInApplicantNameField(overMaxChars);
      UiActions.typeInPermitTypeField('Valid Type');
    } else {
      UiActions.typeInPermitNameField('Valid Permit');
      UiActions.typeInApplicantNameField('Valid Applicant');
      UiActions.typeInPermitTypeField(overMaxChars);
    }

    UiActions.selectStatus('PENDING');
    UiActions.clickSubmitButton();

    // Use appropriate error message based on field
    const errorMessage =
      fieldName === 'permitName'
        ? PERMIT_FORM_ERRORS.invalidPermitName
        : fieldName === 'applicantName'
        ? PERMIT_FORM_ERRORS.invalidApplicantName
        : PERMIT_FORM_ERRORS.invalidPermitType;

    UiAssertions.verifyFormError(fieldName, errorMessage);
  }
}
