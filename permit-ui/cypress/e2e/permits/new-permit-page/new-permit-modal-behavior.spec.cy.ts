import {
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitFixtureKeys } from '../../../fixtures/permits/permit-fixtures';
import { ApiLoadingType, ApiOperation } from '../../../support/api/api-enums';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import { getTestSelector } from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
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
 * • Data Validation: Comprehensive input validation and error messaging
 * • User Experience: Professional modal behavior and form state management
 * • Error Recovery: Clear validation feedback and correction workflows
 *
 * TEST STRATEGY:
 * ==============
 * Uses new test support classes for maintainable, government-ready test patterns:
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 * - PermitFixtures: Consistent test data management
 * - PermitFixtureKeys: Type-safe fixture references
 */

describe('New Permit Modal - Behavior and Validation', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    UiActions.clickNewPermitButton();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  describe('Modal Structure and Navigation', () => {
    it('should render all required modal elements', () => {
      // Verify modal title
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
        'contain.text',
        PERMIT_FORM_HEADERS.newPermit
      );

      // Verify form structure
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM)).should(
        'exist'
      );

      // Verify all form fields exist with proper labels
      UiAssertions.verifyPermitFormFieldExists('permitName');
      UiAssertions.verifyPermitFormFieldExists('applicantName');
      UiAssertions.verifyPermitFormFieldExists('permitType');
      UiAssertions.verifyPermitFormFieldExists('status');

      // Verify submit button
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
        'exist'
      );
    });

    it('should close modal when user clicks close button', () => {
      UiActions.clickModalCloseButton();

      // Verify modal is closed
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'not.exist'
      );

      // Verify return to main page
      UiAssertions.verifyMainPageVisible();
    });

    it('should close modal when user presses escape key', () => {
      // Press escape key
      cy.get('body').type('{esc}');

      // Verify modal closes
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
        'not.exist'
      );
      UiAssertions.verifyMainPageVisible();
    });
  });

  describe('Form State Management', () => {
    it('should clear form when modal is reopened', () => {
      // Fill form with data
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

      // Close and reopen modal
      UiActions.clickModalCloseButton();
      UiActions.clickNewPermitButton();

      // Verify form is cleared
      UiAssertions.verifyFormCleared();
    });
  });

  describe('Professional UX Standards', () => {
    it('should show loading states during form submission', () => {
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);

      // Set up slow API response to observe loading state using new enum-based API
      ApiIntercepts.interceptLoading(
        ApiOperation.CREATE,
        ApiLoadingType.SLOW,
        'slowCreateForLoadingTest'
      );

      UiActions.clickSubmitButton();

      // Verify professional loading state while request is in progress
      UiAssertions.verifyButtonLoading(
        getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)
      );

      // Wait for the slow request to complete
      cy.wait('@slowCreateForLoadingTest');
    });

    it('should maintain professional appearance throughout interactions', () => {
      // Test various interaction patterns
      UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
      UiActions.clearPermitForm();
      UiActions.clickSubmitButton();

      // Verify consistent professional styling
      UiAssertions.verifyProfessionalStyling();
    });
  });
});
