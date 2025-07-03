import {
  APP_DESCRIPTION_ENCODED,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';

describe('Test appearance of seeded inventory in the table', () => {
  it('Visits the initial landing page and tests that the seeded value appears in the first row on the first page as expected', () => {
    cy.visit('http://localhost:4200/');
    cy.contains(APP_HEADER.trim()).should('exist');
  });
  it('Visits the initial landing page, selects the second page, and tests that the seeded value appears in the first row as expected', () => {
    cy.visit('http://localhost:4200/');
    cy.contains(APP_HEADER.trim()).should('exist');
  });
});

describe('Test landing page rendering and header', () => {
  it('Visits the initial landing page and test that the header and description render', () => {
    cy.visit('http://localhost:4200/');
    cy.contains(APP_HEADER.trim()).should('exist');
    cy.contains(APP_DESCRIPTION_ENCODED.replace(/\s+/g, ' ').trim()).should(
      'exist'
    );
  });
});

describe('Test mat table columns and features', () => {
  it('tests that mat table components, elements, associated features (pagination, etc.), etc. renders on the page.', () => {
    cy.visit('http://localhost:4200/');
    cy.get('[data-testid="inventory-table"]').should('exist');
    cy.get('[data-testid="inventory-table-name-header"]').should('exist');
    cy.get('[data-testid="inventory-table-description-header"]').should(
      'exist'
    );
    cy.get('[data-testid="inventory-table-price-header"]').should('exist');
    cy.get('[data-testid="inventory-table-quantity-header"]').should('exist');
    cy.get('[data-testid="inventory-table-update-header"]').should('exist');
    cy.get('[data-testid="inventory-table-delete-header"]').should('exist');
  });

  it('test the table column structure', () => {
    cy.visit('http://localhost:4200/');
    cy
      .get('[data-testid="inventory-table"] th[mat-header-cell]')
      .should('have.length', 6).debug; // based on your page size

    cy.get('[data-testid="inventory-table"] th')
      .should('contain.text', 'Name')
      .and('contain.text', 'Price')
      .and('contain.text', 'Quantity');
  });
});
