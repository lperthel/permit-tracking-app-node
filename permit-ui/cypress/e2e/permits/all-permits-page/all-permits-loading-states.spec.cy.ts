import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { ApiIntercepts } from '../../../support/api-intercepts';
import {
  getTestSelector,
  selector_shortcuts,
} from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';
import { UiAssertions } from '../../../support/ui-assertions';

/*
 * OVERVIEW:
 * =========
 * This test suite validates that the All Permits page provides appropriate visual feedback during
 * asynchronous operations, ensuring government users receive clear loading indicators and maintain
 * confidence that the application is processing their requests.
 *
 * GOVERNMENT REQUIREMENTS TESTED:
 * ===============================
 * • User Experience: Clear visual feedback during data loading operations
 */

describe('All Permits Page - Loading State Behavior', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
  });

  it('should show and hide loading spinner during network requests', () => {
    // Use slowEmpty for consistent testing
    ApiIntercepts.interceptLoading('get', 'slowEmpty', 'slowRequest');

    // Trigger refresh
    UiActions.clickRefreshButton();

    // Verify loading state appears
    UiActions.waitForLoadingSpinner();
    UiAssertions.verifyLoadingState();

    // Wait for request to complete
    cy.wait('@slowRequest');

    // Verify loading spinner disappears
    UiActions.waitForLoadingToComplete();
  });

  it('should show loading spinner with proper accessibility attributes', () => {
    //Make a slow loading request
    ApiIntercepts.interceptLoading('get', 'slowEmpty', 'slowLoad');

    // Trigger slow request
    UiActions.clickRefreshButton();

    // Verify loading state with accessibility
    UiActions.waitForLoadingSpinner();
    UiAssertions.verifyLoadingAccessibility();
    UiAssertions.verifyLoadingState();

    // Wait for request completion (should be ~1.5 seconds)
    cy.wait('@slowLoad');

    // Verify loading clears and data loads
    UiActions.waitForLoadingToComplete();
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE)
    ).should('be.visible');
  });

  it('should maintain UI responsiveness during loading', () => {
    // Use slowEmpty for consistent behavior
    ApiIntercepts.interceptLoading('get', 'slowEmpty', 'moderateDelay');

    // Trigger refresh
    UiActions.clickRefreshButton();

    // Verify loading state
    UiAssertions.verifyLoadingState();

    // Verify other UI elements remain accessible during loading
    cy.get(selector_shortcuts.table).should('be.visible');
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON)
    ).should('be.visible');

    // Wait for completion
    cy.wait('@moderateDelay');

    // Verify loading completes
    UiActions.waitForLoadingToComplete();
  });
});
