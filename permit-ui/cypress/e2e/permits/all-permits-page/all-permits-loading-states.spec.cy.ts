import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { ApiLoadingType, ApiOperation } from '../../../support/api/api-enums';
import { ApiIntercepts } from '../../../support/api/api-intercepts';
import {
  getTestSelector,
  selector_shortcuts,
} from '../../../support/ui/cypress-selectors';
import { UiActions } from '../../../support/ui/ui-actions';
import { UiAssertions } from '../../../support/ui/ui-assertions';

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
    // Use slowEmpty for consistent testing with new enum-based API
    ApiIntercepts.interceptLoading(
      ApiOperation.GET,
      ApiLoadingType.SLOW_EMPTY,
      'slowRequest'
    );

    // Trigger refresh
    UiActions.clickRefreshButton();

    // Verify loading state appears
    UiActions.waitForAllPermitsLoadingSpinner();
    UiAssertions.verifyAllPermitsLoadingState();

    // Wait for request to complete
    cy.wait('@slowRequest');

    // Verify loading spinner disappears
    UiActions.waitForAllPermitsLoadingToComplete();
  });

  it('should show loading spinner with proper accessibility attributes', () => {
    // Make a slow loading request with new enum-based API
    ApiIntercepts.interceptLoading(
      ApiOperation.GET,
      ApiLoadingType.SLOW_EMPTY,
      'slowLoad'
    );

    // Trigger slow request
    UiActions.clickRefreshButton();

    // Verify loading state with accessibility
    UiActions.waitForAllPermitsLoadingSpinner();
    UiAssertions.verifyAllPermitsLoadingAccessibility();
    UiAssertions.verifyAllPermitsLoadingState();

    // Wait for request completion (should be ~1.5 seconds)
    cy.wait('@slowLoad');

    // Verify loading clears and data loads
    UiActions.waitForAllPermitsLoadingToComplete();
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMITS_TABLE)
    ).should('be.visible');
  });

  it('should maintain UI responsiveness during loading', () => {
    // Use slowEmpty for consistent behavior with new enum-based API
    ApiIntercepts.interceptLoading(
      ApiOperation.GET,
      ApiLoadingType.SLOW_EMPTY,
      'moderateDelay'
    );

    // Trigger refresh
    UiActions.clickRefreshButton();

    // Verify loading state
    UiAssertions.verifyAllPermitsLoadingState();

    // Verify other UI elements remain accessible during loading
    cy.get(selector_shortcuts.table).should('be.visible');
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON)
    ).should('be.visible');

    // Wait for completion
    cy.wait('@moderateDelay');

    // Verify loading completes
    UiActions.waitForAllPermitsLoadingToComplete();
  });
});
