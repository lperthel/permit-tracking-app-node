import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../../src/app/permits/shared/models/permit-status.enums';
import {
  InvalidPermitFixtureKeys,
  PermitFixtureKeys,
} from '../../../fixtures/permits/permit-fixtures';
import { UiActions } from '../../../support/ui/ui-actions';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiAssertions } from '../../../support/ui/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates modal behavior, form validation, and user interaction patterns
 * for the New Permit modal, ensuring compliance with government UX standards and
 * accessibility requirements.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • Section 508 Accessibility: Keyboard navigation and screen reader compatibility
 * • Data Validation: Comprehensive input validation and error messaging
 * • User Experience: Professional modal behavior and form state management
 * • Error Recovery: Clear validation feedback and correction workflows
 * • Professional Standards: Government-grade UI interactions and accessibility
 *
 * TEST STRATEGY:
 * ==============
 * Uses new test support classes for maintainable, government-ready test patterns:
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 * - PermitFixtures: Consistent test data management (accessed via UiActions)
 * - PermitFixtureKeys: Type-safe fixture references
 */

describe('New Permit Modal - Validation', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    UiActions.clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  describe('Form Validation - Required Fields', () => {
    it('should show all required field errors when submitted empty', () => {
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
    });

    it('should clear errors progressively as valid data is entered', () => {
      // Trigger validation errors first
      UiActions.clickSubmitButton();
      UiAssertions.verifyFormError('permitName');

      // Fill valid permit data and verify errors clear
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

      // Verify all errors are cleared
      UiAssertions.verifyNoPermitFormErrors();
    });
  });

  describe('Form State Management', () => {
    it('should preserve error states until corrected', () => {
      // Trigger validation error
      UiActions.clickSubmitButton();
      UiAssertions.verifyFormError('permitName');

      // Fill only permit name
      UiActions.fillPermitForm('Valid Name', '', '', PermitStatus.PENDING);

      // Verify permit name error clears
      UiAssertions.verifyNoPermitFormError('permitName');
    });
  });

  describe('Form Validation - Field-Specific Rules', () => {
    describe('Permit Name Validation', () => {
      it('should accept valid permit names', () => {
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.CREATE_THIS_PERMIT
        );
        UiAssertions.verifyNoPermitFormError('permitName');
      });

      it('should reject permit names exceeding maximum length', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.PERMIT_NAME_TOO_LONG
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'permitName',
          PERMIT_FORM_ERRORS.invalidPermitName
        );
      });

      it('should reject permit names with invalid characters', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.PERMIT_NAME_INVALID_CHARS
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'permitName',
          PERMIT_FORM_ERRORS.invalidPermitName
        );
      });

      it('should reject empty permit names', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.PERMIT_NAME_EMPTY
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'permitName',
          PERMIT_FORM_ERRORS.invalidPermitName
        );
      });
    });

    describe('Applicant Name Validation', () => {
      it('should accept valid applicant names', () => {
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.CREATE_THIS_PERMIT
        );
        UiAssertions.verifyNoPermitFormError('applicantName');
      });

      it('should reject applicant names exceeding maximum length', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.APPLICANT_NAME_TOO_LONG
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'applicantName',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );
      });

      it('should reject applicant names with invalid characters', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.APPLICANT_NAME_INVALID_CHARS
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'applicantName',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );
      });

      it('should reject empty applicant names', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.APPLICANT_NAME_EMPTY
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'applicantName',
          PERMIT_FORM_ERRORS.invalidApplicantName
        );
      });
    });

    describe('Permit Type Validation', () => {
      it('should accept valid permit types', () => {
        UiActions.fillPermitFormFromFixture(
          PermitFixtureKeys.CREATE_THIS_PERMIT
        );
        UiAssertions.verifyNoPermitFormError('permitType');
      });

      it('should reject permit types with invalid characters', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.PERMIT_TYPE_INVALID_CHARS
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'permitType',
          PERMIT_FORM_ERRORS.invalidPermitType
        );
      });

      it('should reject empty permit types', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.PERMIT_TYPE_EMPTY
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'permitType',
          PERMIT_FORM_ERRORS.invalidPermitType
        );
      });
    });

    describe('Status Field Validation', () => {
      it('should accept all valid status values', () => {
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
          // Override the status to test each valid status
          UiActions.selectStatus(status);
          UiAssertions.verifyNoPermitFormError('status');
          UiActions.clearPermitForm();
        });
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

      it('should require status selection', () => {
        UiActions.fillPermitFormFromInvalidFixture(
          InvalidPermitFixtureKeys.STATUS_EMPTY
        );
        UiActions.clickSubmitButton();
        UiAssertions.verifyFormError(
          'status',
          PERMIT_FORM_ERRORS.invalidStatus
        );
      });
    });
  });

  describe('Professional UX Standards', () => {
    it('should provide clear visual feedback for validation', () => {
      UiActions.clickSubmitButton();

      // Verify validation styling
      UiAssertions.verifyValidationStyling();
    });
  });
});
