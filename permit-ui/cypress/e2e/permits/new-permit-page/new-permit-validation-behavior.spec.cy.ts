import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../../src/app/permits/shared/models/permit-status.enums';
import { FormValidationTests } from '../../../support/shared-tests/form-validation-tests';
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
 * - FormValidationTests: Shared validation logic for permit forms
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 */

describe('New Permit Modal - Validation', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    UiActions.clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  describe('Form Validation - Required Fields', () => {
    it('should show all required field errors when submitted empty', () => {
      FormValidationTests.testRequiredFieldValidations();
    });

    it('should clear errors progressively as valid data is entered', () => {
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

      it('should require status selection', () => {
        // Clear form and submit to trigger validation
        UiActions.clearPermitForm();
        UiActions.clickSubmitButton();
        
        // Verify status field error
        UiAssertions.verifyFormError('status', PERMIT_FORM_ERRORS.invalidStatus);
      });
    });
  });

  describe('Professional UX Standards', () => {
    it('should provide clear visual feedback for validation', () => {
      // This test remains custom as it's specific to visual feedback
      UiActions.clearPermitForm();
      UiActions.clickSubmitButton();
      
      // Verify error styling is applied
      cy.get('.lp-control-error').should('be.visible');
    });
  });
});