import {
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { ApiLoadingType, ApiOperation } from '../../../support/api/api-enums';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import {
  getTestSelector,
  selector_shortcuts,
} from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

/*
 * Tests modal behavior and user interactions for the update permit modal.
 */

describe('Update Permit - Modal Behavior', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    // Wait for table to load with permits
    UiActions.waitForTableLoad();
    // Click update button on first permit to open update modal
    UiActions.clickUpdatePermitButton(0);
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  describe('Modal Structure and Navigation', () => {
    it('should render all required modal elements', () => {
      // Verify modal title for UPDATE permit (not new permit)
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_TITLE)).should(
        'contain.text',
        PERMIT_FORM_HEADERS.updatePermit
      );

      // Verify modal close button exists and is accessible
      cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON)).should(
        'exist'
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
    it('should restore original data when modal is reopened', () => {
      // Modify existing data
      cy.get(selector_shortcuts.permitForm.inputPermitName)
        .clear()
        .type('Modified Name');

      // Close and reopen modal by clicking update on same permit
      UiActions.clickModalCloseButton();
      UiActions.clickUpdatePermitButton(0);

      // Verify form is restored to original permit data (not cleared like new permit)
      cy.get(selector_shortcuts.permitForm.inputPermitName).should(
        'not.contain.value',
        'Modified Name'
      );
    });
  });

  describe('Professional UX Standards', () => {
    it('should show loading states during form submission', () => {
      // Form should already be populated with existing permit data
      // Just modify one field to trigger an update
      cy.get(selector_shortcuts.permitForm.inputPermitName)
        .clear()
        .type('Updated Permit Name');

      // Set up slow API response to observe loading state using new enum-based API
      ApiIntercepts.interceptLoading(
        ApiOperation.UPDATE,
        ApiLoadingType.SLOW,
        'slowUpdateForLoadingTest'
      );

      UiActions.clickSubmitButton();

      // Verify professional loading state while request is in progress
      UiAssertions.verifyButtonLoading(
        getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)
      );

      // Wait for the slow request to complete
      cy.wait('@slowUpdateForLoadingTest');
    });
  });
});
