// ES2022 test helper functions for permit application testing
import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import { dev_env } from '../../src/environments/environment';
import { selectors } from './cypress-selectors';

/**
 * Create a test permit via API for test setup
 */
export const createTestPermit = (permit: Partial<Permit>) => {
  const defaultPermit: Partial<Permit> = {
    permitName: 'Test Permit',
    applicantName: 'Test Applicant',
    permitType: 'Construction',
    status: PermitStatus.PENDING,
    ...permit,
  };

  return cy
    .request({
      method: 'POST',
      url: `${dev_env.apiUrl}/permits`,
      body: defaultPermit,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(201);
      return response.body.id;
    });
};

/**
 * Delete a permit by ID for test cleanup
 */
export const deleteTestPermit = (permitId: string) => {
  return cy.request({
    method: 'DELETE',
    url: `${dev_env.apiUrl}/permits/${permitId}`,
    failOnStatusCode: false, // Don't fail if permit already deleted
  });
};

/**
 * Wait for permit table to load with data
 */
export const waitForPermitTable = () => {
  cy.get(selectors.table).should('exist');
  cy.get(selectors.permitRowName(0)).should('exist');
};

/**
 * Fill out the permit form with test data using correct selectors
 */
export const fillPermitFormWithDefaults = () => {
  cy.get(selectors.permitForm.inputPermitName).type('Integration Test Permit');
  cy.get(selectors.permitForm.inputApplicant).type('Test Applicant Name');
  cy.get(selectors.permitForm.inputPermitType).type('Construction');

  // For dropdown status field, select from dropdown instead of typing
  cy.get(selectors.permitForm.inputStatus).select(PermitStatus.PENDING);
};

/**
 * Navigate to a specific page in the permit table
 * Note: You'll need to add pagination selectors to your constants/selectors
 */
export const goToPermitTablePage = (
  page: 'first' | 'last' | 'next' | 'prev'
) => {
  const paginationSelectors = {
    first: '[aria-label="First page"]',
    last: '[aria-label="Last page"]',
    next: '[aria-label="Next page"]',
    prev: '[aria-label="Previous page"]',
  } as const;

  cy.get(paginationSelectors[page]).click({ force: true });
  waitForPermitTable();
};

/**
 * Complete permit creation workflow using proper selectors
 */
export const createPermitThroughUI = (permit: Partial<Permit>) => {
  cy.get(selectors.createButton).click();

  if (permit.permitName) {
    cy.get(selectors.permitForm.inputPermitName)
      .clear()
      .type(permit.permitName);
  }
  if (permit.applicantName) {
    cy.get(selectors.permitForm.inputApplicant)
      .clear()
      .type(permit.applicantName);
  }
  if (permit.permitType) {
    cy.get(selectors.permitForm.inputPermitType)
      .clear()
      .type(permit.permitType);
  }
  if (permit.status) {
    // For dropdown status field, use select instead of type
    cy.get(selectors.permitForm.inputStatus).select(permit.status);
  }

  // Note: You'll need to add submit button selector to your constants
  cy.get('[data-testid="submit-button"]').click();
};

/**
 * Verify permit appears in table at specific row
 */
export const verifyPermitInTable = (permit: Partial<Permit>, rowIndex = 0) => {
  if (permit.permitName) {
    cy.get(selectors.permitRowName(rowIndex)).should(
      'contain.text',
      permit.permitName
    );
  }
  if (permit.applicantName) {
    cy.get(selectors.permitRowApplicantName(rowIndex)).should(
      'contain.text',
      permit.applicantName
    );
  }
  if (permit.permitType) {
    cy.get(selectors.permitRowPermitType(rowIndex)).should(
      'contain.text',
      permit.permitType
    );
  }
  if (permit.status) {
    cy.get(selectors.permitRowStatus(rowIndex)).should(
      'contain.text',
      permit.status
    );
  }
};

/**
 * Get the total number of permits in the table
 */
export const getPermitTableRowCount = () => {
  return cy.get(selectors.table).find('tbody tr').its('length');
};

/**
 * Wait for specific number of permits to be visible in table
 */
export const waitForPermitCount = (expectedCount: number) => {
  cy.get(selectors.table).find('tbody tr').should('have.length', expectedCount);
};
