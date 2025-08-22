import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../../../src/app/permits/permit-form-model/permit-form.constants';
import { ApiIntercepts } from '../../../support/api-intercepts';
import { getTestSelector, selectors } from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';
import { UiAssertions } from '../../../support/ui-assertions';

describe('All Permits Page - Empty State Handling', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
  });

  it('should display empty state when no permits exist', () => {
    // Intercept and return empty array using helper
    ApiIntercepts.interceptSuccess('empty', 'emptyResponse');

    // Trigger refresh to get empty state
    UiActions.clickRefreshButton();

    // Wait for empty response
    cy.wait('@emptyResponse');

    // Verify loading completes and empty state appears
    UiActions.waitForLoadingToComplete();
    UiAssertions.verifyEmptyState();

    // Verify empty state has proper accessibility
    const EMPTY_STATE_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
    );
    cy.get(EMPTY_STATE_SELECTOR).should('have.attr', 'role', 'status');

    // Verify "Create First Permit" button is available
    cy.get(EMPTY_STATE_SELECTOR)
      .find('button')
      .should(
        'contain.text',
        AllPermitsComponentConstants.UI_TEXT.CREATE_FIRST_PERMIT
      )
      .and('be.visible')
      .and('not.be.disabled');

    // Verify main "New Permit" button is still available
    cy.get(selectors.createButton).should('be.visible').and('not.be.disabled');

    // Verify table headers are rendered but no data rows
    cy.get(selectors.table).should('be.visible');
    cy.get(`${selectors.table} tbody tr`).should('have.length', 0);
  });

  it('should not show empty state while loading', () => {
    // Use the new empty loading response
    ApiIntercepts.interceptLoading('get', 'slowEmpty', 'delayedEmpty');

    // Trigger refresh
    UiActions.clickRefreshButton();

    // While loading, empty state should not appear yet
    UiAssertions.verifyLoadingState();

    const EMPTY_STATE_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
    );
    cy.get(EMPTY_STATE_SELECTOR).should('not.exist');

    // After loading completes, empty state should appear
    cy.wait('@delayedEmpty');
    UiActions.waitForLoadingToComplete();
    UiAssertions.verifyEmptyState();
  });

  it('should allow navigation to create permit from empty state', () => {
    // Set up empty state using helper
    ApiIntercepts.interceptSuccess('empty', 'emptyState');

    UiActions.clickRefreshButton();
    cy.wait('@emptyState');

    // Click "Create First Permit" button from empty state
    cy.get(
      getTestSelector(
        AllPermitsComponentConstants.TEST_IDS.CREATE_FIRST_PERMIT_BUTTON
      )
    ).click();

    // Verify navigation to new permit form
    cy.url().should('include', '/new-permit');

    // Verify modal opens
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  it('should show empty state with proper accessibility features', () => {
    // Set up empty state using helper
    ApiIntercepts.interceptSuccess('empty', 'emptyState');

    UiActions.clickRefreshButton();
    cy.wait('@emptyState');

    // Verify empty state accessibility
    const EMPTY_STATE_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
    );
    cy.get(EMPTY_STATE_SELECTOR)
      .should('have.attr', 'role', 'status')
      .and('be.visible');

    // Verify empty state content is properly structured
    cy.get(EMPTY_STATE_SELECTOR)
      .find('h6')
      .should(
        'contain.text',
        AllPermitsComponentConstants.UI_TEXT.NO_PERMITS_FOUND
      );

    // Verify action button is keyboard accessible
    cy.get(EMPTY_STATE_SELECTOR)
      .find('button')
      .should('be.visible')
      .and('not.be.disabled')
      .focus();

    // Verify button can be activated via keyboard
    cy.get(EMPTY_STATE_SELECTOR).find('button:focus').should('exist');
  });

  it('should transition from empty state to populated when data loads', () => {
    // Start with empty state using helper
    ApiIntercepts.interceptSuccess('empty', 'emptyState');

    UiActions.clickRefreshButton();
    cy.wait('@emptyState');

    // Verify empty state appears
    UiAssertions.verifyEmptyState();

    // Change intercept to return data using helper
    ApiIntercepts.interceptSuccess('getList', 'populatedState');

    // Refresh again
    UiActions.clickRefreshButton();
    cy.wait('@populatedState');

    // Verify empty state disappears and data appears
    UiAssertions.verifyNoError();
    const EMPTY_STATE_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
    );
    cy.get(EMPTY_STATE_SELECTOR).should('not.exist');

    // Verify that at least one permit appears (don't hardcode the name)
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(0))
    )
      .should('exist')
      .and('not.be.empty');

    // Verify table now has data rows
    cy.get(`${selectors.table} tbody tr`).should('have.length.greaterThan', 0);
  });
});
