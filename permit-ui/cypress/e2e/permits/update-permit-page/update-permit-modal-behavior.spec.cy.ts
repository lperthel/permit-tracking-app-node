import {
  PERMIT_FORM_HEADERS,
  PERMIT_FORM_SELECTORS,
} from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { ApiIntercepts } from '../../../support/api-intercepts';
import { getTestSelector, selectors } from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';
import { UiAssertions } from '../../../support/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates modal behavior and user interaction patterns
 * for the UPDATE Permit modal, ensuring compliance with government UX standards.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • User Experience: Professional modal behavior and form state management
 * • Error Recovery: Clear validation feedback and correction workflows
 * • Professional Standards: Government-grade UI interactions and accessibility
 *
 * TEST STRATEGY:
 * ==============
 * Uses new test support classes for maintainable, government-ready test patterns:
 * - UiActions: Centralized UI interactions
 * - UiAssertions: Standardized verification patterns
 * - PermitFixtures: Consistent test data management
 * - PermitFixtureKeys: Type-safe fixture references
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
      UiAssertions.verifyFormFieldExists('permitName');
      UiAssertions.verifyFormFieldExists('applicantName');
      UiAssertions.verifyFormFieldExists('permitType');
      UiAssertions.verifyFormFieldExists('status');

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
    it.only('should populate form with existing permit data', () => {
      // Close modal first to see table
      UiActions.clickModalCloseButton();

      // Capture table data
      cy.get(selectors.permitRowName(0))
        .invoke('text')
        .then((permitName) => {
          cy.get(selectors.permitRowApplicantName(0))
            .invoke('text')
            .then((applicantName) => {
              cy.get(selectors.permitRowPermitType(0))
                .invoke('text')
                .then((permitType) => {
                  cy.get(selectors.permitRowStatus(0))
                    .invoke('text')
                    .then((status) => {
                      // Now open modal again
                      UiActions.clickUpdatePermitButton(0);

                      // Verify form matches captured data
                      cy.get(selectors.permitForm.inputPermitName).should(
                        'have.value',
                        permitName.trim()
                      );
                      cy.get(selectors.permitForm.inputApplicant).should(
                        'have.value',
                        applicantName.trim()
                      );
                      cy.get(selectors.permitForm.inputPermitType).should(
                        'have.value',
                        permitType.trim()
                      );
                      cy.get(selectors.permitForm.inputStatus).should(
                        'have.value',
                        status.trim()
                      );
                    });
                });
            });
        });
    });

    it('should restore original data when modal is reopened', () => {
      // Modify existing data
      cy.get(selectors.permitForm.inputPermitName)
        .clear()
        .type('Modified Name');

      // Close and reopen modal by clicking update on same permit
      UiActions.clickModalCloseButton();
      UiActions.clickUpdatePermitButton(0);

      // Verify form is restored to original permit data (not cleared like new permit)
      cy.get(selectors.permitForm.inputPermitName).should(
        'not.contain.value',
        'Modified Name'
      );
    });
  });

  describe('Professional UX Standards', () => {
    it('should show loading states during form submission', () => {
      // Form should already be populated with existing permit data
      // Just modify one field to trigger an update
      cy.get(selectors.permitForm.inputPermitName)
        .clear()
        .type('Updated Permit Name');

      // Set up slow API response to observe loading state
      ApiIntercepts.interceptLoading(
        'update', // Changed from 'create' to 'update'
        'slow',
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
