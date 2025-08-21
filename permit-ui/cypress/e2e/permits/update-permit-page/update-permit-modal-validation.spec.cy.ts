import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { getTestSelector } from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';
import { UiAssertions } from '../../../support/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates form validation  for the UPDATE Permit
 * modal, ensuring compliance with government UX standards and
 * accessibility requirements.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • Data Validation: Comprehensive input validation and error messaging
 *
 * TEST STRATEGY:
 * ==============
 * Uses new test support classes for maintainable, government-ready test patterns:
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 */

describe('Update Permit Modal - Behavior', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    // Wait for table to load with permits
    UiActions.waitForTableLoad();
    // Click update button on first permit to open update modal
    UiActions.clickUpdatePermitButton(0);
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  describe('Form Validation - Required Fields', () => {
    it('should show all required field errors when all fields are cleared and submitted', () => {
      // Clear all fields in the pre-populated form
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
    });
  });
});
