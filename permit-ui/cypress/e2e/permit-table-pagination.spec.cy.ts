import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { dev_env } from '../../src/environments/environment';
import { selectors } from '../support/cypress-selectors';
import { waitForPermitTable } from '../support/permit_test_helpers';

// Environment configuration
const UI_SERVER = dev_env.uiUrl;

describe('Permit Table Pagination Integration Tests', () => {
  beforeEach(() => {
    // Visit the app before each test for isolation
    cy.visit(UI_SERVER);
    // Wait for the table using ES2022 function
    waitForPermitTable();
  });

  it('should display the permit table with pagination controls', () => {
    // Verify table structure exists
    cy.get(selectors.table).should('be.visible');

    // Verify all column headers are present using proper selectors
    cy.get(selectors.headers.permitName).should('contain.text', 'Permit Name');
    cy.get(selectors.headers.applicantName).should(
      'contain.text',
      'Applicant Name'
    );
    cy.get(selectors.headers.permitType).should('contain.text', 'Permit Type');
    cy.get(selectors.headers.status).should('contain.text', 'Status');
    cy.get(selectors.headers.update).should('contain.text', 'Update');
    cy.get(selectors.headers.delete).should('contain.text', 'Delete');

    // Verify pagination controls exist
    cy.get('mat-paginator').should('exist');
    cy.get('mat-paginator').should('contain.text', 'Items per page');
  });

  it('should show only 10 items per page by default', () => {
    // Wait for data to load
    cy.get(selectors.permitRowName(0)).should('exist');

    // Count visible table rows (excluding header)
    cy.get(selectors.table)
      .find('tr[mat-row]')
      .should('have.length.at.most', 10);

    // Verify first row exists
    cy.get(selectors.permitRowName(0)).should('be.visible');

    // Verify 11th row doesn't exist (pagination working)
    cy.get(selectors.permitRowName(10)).should('not.exist');
  });

  it('should navigate between pages and maintain data', () => {
    // Wait for initial data
    cy.get(selectors.permitRowName(0)).should('exist');

    // Store first page first item text as a variable, not an alias
    let firstPageFirstItemText: string;
    cy.get(selectors.permitRowName(0))
      .invoke('text')
      .then((text) => {
        firstPageFirstItemText = text;
      });

    // Navigate to next page using centralized selector
    cy.get(selectors.pagination.next).click();

    // Verify we're on a different page (different data)
    cy.get(selectors.permitRowName(0)).then((element) => {
      const currentPageText = element.text();
      expect(currentPageText).to.not.equal(firstPageFirstItemText);
    });

    // Navigate back to first page using centralized selector
    cy.get(selectors.pagination.prev).click();

    // Verify we're back to original data
    cy.get(selectors.permitRowName(0)).then((element) => {
      const backToFirstPageText = element.text();
      console.log('Back to first page text:', backToFirstPageText);
      expect(backToFirstPageText).to.equal(firstPageFirstItemText);
    });
  });

  it('should navigate to first and last pages correctly', () => {
    // Wait for data
    cy.get(selectors.permitRowName(0)).should('exist');

    // Store first page data as a variable, not an alias
    let firstPageData: string;
    cy.get(selectors.permitRowName(0))
      .invoke('text')
      .then((text) => {
        firstPageData = text;
        console.log('Stored first page data:', firstPageData);
      });

    // Go to last page using centralized selector
    cy.get(selectors.pagination.last).click();
    cy.get(selectors.permitRowName(0)).should('exist');

    // Store last page data as a variable
    let lastPageData: string;
    cy.get(selectors.permitRowName(0))
      .invoke('text')
      .then((text) => {
        lastPageData = text;
        console.log('Stored last page data:', lastPageData);

        // Verify last page data is different from first page
        expect(lastPageData).to.not.equal(firstPageData);
      });

    // Navigate to first page using centralized selector
    cy.get(selectors.pagination.first).click();

    // Verify we're back to first page data
    cy.get(selectors.permitRowName(0)).then((element) => {
      const backToFirstPageData = element.text();
      console.log('Back to first page data:', backToFirstPageData);
      expect(backToFirstPageData).to.equal(firstPageData);
    });
  });

  describe('Page Size Controls', () => {
    const setPageSize = (pageSize: number) => {
      cy.get('mat-paginator').find('mat-select').click({ force: true });
      cy.get('mat-option').contains(`${pageSize}`).click({ force: true });
      // Wait for table to update
      cy.wait(100);
    };

    it('should change items per page when page size is modified', () => {
      // Wait for initial data
      cy.get(selectors.permitRowName(0)).should('exist');

      // Change to 2 items per page
      setPageSize(2);

      // Verify only 2 rows are visible
      cy.get(selectors.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', 2);

      // Verify 3rd row doesn't exist
      cy.get(selectors.permitRowName(2)).should('not.exist');

      // Change to 6 items per page
      setPageSize(6);

      // Verify more rows are now visible (up to 6)
      cy.get(selectors.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', 6);
    });

    it('should maintain page size selection across navigation', () => {
      // Set page size to 2
      setPageSize(2);

      // Navigate to next page using centralized selector
      cy.get(selectors.pagination.next).click();

      // Verify still showing 2 items
      cy.get(selectors.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', 2);
    });
  });
});

describe('Application Header Integration Tests', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should render application header and description correctly', () => {
    cy.contains(AllPermitsComponentConstants.APP_HEADER.trim()).should(
      'be.visible'
    );
    cy.contains(
      AllPermitsComponentConstants.APP_DESCRIPTION_ENCODED.replace(
        /\s+/g,
        ' '
      ).trim()
    ).should('be.visible');
  });
});

describe('Table Structure Integration Tests', () => {
  beforeEach(() => {
    cy.visit(UI_SERVER);
  });

  it('should have correct table column structure', () => {
    cy.get(selectors.table).should('exist');

    // Verify we have exactly 6 columns using proper selector
    cy.get(`${selectors.table} th[mat-header-cell]`).should('have.length', 6);

    // Verify column headers contain expected text using individual selectors
    cy.get(selectors.headers.permitName).should('contain.text', 'Permit Name');
    cy.get(selectors.headers.applicantName).should(
      'contain.text',
      'Applicant Name'
    );
    cy.get(selectors.headers.permitType).should('contain.text', 'Permit Type');
    cy.get(selectors.headers.status).should('contain.text', 'Status');
    cy.get(selectors.headers.update).should('contain.text', 'Update');
    cy.get(selectors.headers.delete).should('contain.text', 'Delete');
  });

  it('should render action buttons in table rows', () => {
    // Wait for data to load
    cy.get(selectors.permitRowName(0)).should('exist');

    // Verify update button exists and is clickable
    cy.get(selectors.permitRowUpdate(0))
      .find('button')
      .should('exist')
      .and('contain.text', 'Update')
      .and('not.be.disabled');

    // Verify delete button exists and is clickable
    cy.get(selectors.permitRowDelete(0))
      .find('button')
      .should('exist')
      .and('contain.text', 'Delete')
      .and('not.be.disabled');
  });
});
