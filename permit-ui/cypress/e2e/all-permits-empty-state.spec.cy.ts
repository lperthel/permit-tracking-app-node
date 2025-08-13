import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../src/app/permits/permit-form-model/permit-form.constants';
import { dev_env } from '../../src/environments/environment';
import { getTestSelector, selectors } from '../support/cypress-selectors';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;
const API_BASE_URL = dev_env.apiUrl;

// String constants at top of file per coding guidelines
const PERMITS_API_ENDPOINT = '/permits';
const LOADING_SPINNER_SELECTOR = '.spinner-border[role="status"]';
const EMPTY_STATE_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
);
const REFRESH_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.REFRESH_PERMITS_BUTTON
);
const NEW_PERMIT_BUTTON_SELECTOR = getTestSelector(
  AllPermitsComponentConstants.TEST_IDS.NEW_PERMIT_BUTTON
);

describe('All Permits Page - Empty State Handling', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should display empty state when no permits exist', () => {
    // Intercept and return empty array
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      statusCode: 200,
      body: [],
    }).as('emptyResponse');

    // Trigger refresh to get empty state
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // Wait for empty response
    cy.wait('@emptyResponse');

    // Verify loading spinner disappears
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');

    // Verify empty state appears using UI_TEXT constants
    cy.get(EMPTY_STATE_SELECTOR).should('be.visible');
    cy.get(EMPTY_STATE_SELECTOR).should(
      'contain.text',
      AllPermitsComponentConstants.UI_TEXT.NO_PERMITS_FOUND
    );

    // Verify empty state has proper role
    cy.get(EMPTY_STATE_SELECTOR).should('have.attr', 'role', 'status');

    // Verify "Create First Permit" button is available using selector
    cy.get(EMPTY_STATE_SELECTOR)
      .find('button')
      .should(
        'contain.text',
        AllPermitsComponentConstants.UI_TEXT.CREATE_FIRST_PERMIT
      )
      .and('be.visible')
      .and('not.be.disabled');

    // Verify main "New Permit" button is still available using existing selector
    cy.get(NEW_PERMIT_BUTTON_SELECTOR)
      .should('be.visible')
      .and('not.be.disabled');

    // Verify table headers are still rendered but no data rows using existing selector
    cy.get(selectors.table).should('be.visible');
    cy.get(`${selectors.table} tr[mat-row]`).should('have.length', 0);
  });

  it('should not show empty state while loading', () => {
    // Intercept with delay and empty response
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      delay: 1000,
      body: [],
    }).as('delayedEmpty');

    // Trigger refresh
    cy.get(REFRESH_BUTTON_SELECTOR).click();

    // While loading, empty state should not appear
    cy.get(LOADING_SPINNER_SELECTOR).should('exist');
    cy.get(EMPTY_STATE_SELECTOR).should('not.exist');

    // After loading completes, empty state should appear
    cy.wait('@delayedEmpty');
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');
    cy.get(EMPTY_STATE_SELECTOR).should('be.visible');
  });

  it('should allow navigation to create permit from empty state', () => {
    // Set up empty state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      body: [],
    }).as('emptyState');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@emptyState');

    // Click "Create First Permit" button from empty state
    cy.get(
      getTestSelector(
        AllPermitsComponentConstants.TEST_IDS.CREATE_FIRST_PERMIT_BUTTON
      )
    ).click();

    // Verify navigation to new permit form
    cy.url().should('include', '/new-permit');

    // Verify modal opens using proper data-testid selector
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should('exist');
  });

  it('should show empty state with proper accessibility features', () => {
    // Set up empty state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      body: [],
    }).as('emptyState');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@emptyState');

    // Verify empty state accessibility
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
    // Start with empty state
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      body: [],
    }).as('emptyState');

    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@emptyState');

    // Verify empty state appears
    cy.get(EMPTY_STATE_SELECTOR).should('be.visible');

    // Change intercept to return data
    cy.intercept('GET', `${API_BASE_URL}${PERMITS_API_ENDPOINT}`, {
      body: [
        {
          id: '1',
          permitName: 'New Permit',
          applicantName: 'New Applicant',
          permitType: 'Construction',
          status: 'PENDING',
        },
      ],
    }).as('populatedState');

    // Refresh again
    cy.get(REFRESH_BUTTON_SELECTOR).click();
    cy.wait('@populatedState');

    // Verify empty state disappears and data appears
    cy.get(EMPTY_STATE_SELECTOR).should('not.exist');
    cy.get(
      getTestSelector(AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(0))
    ).should('contain.text', 'New Permit');
  });
});
