import { AllPermitsComponentConstants } from '../../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { selector_shortcuts } from '../../../support/cypress-selectors';
import { UiActions } from '../../../support/ui-actions';

// Constants defined at top of file as per coding guidelines
const EXPECTED_COLUMN_COUNT = 6;
const DEFAULT_PAGE_SIZE = 10;
const SMALL_PAGE_SIZE = 2;
const MEDIUM_PAGE_SIZE = 6;
const MAX_VISIBLE_ROWS_SMALL = 2;
const MAX_VISIBLE_ROWS_MEDIUM = 6;
const THIRD_ROW_INDEX = 2;
const FIRST_ROW_INDEX = 0;
const ELEVENTH_ROW_INDEX = 10;

describe('Permit Table Integration Tests', () => {
  beforeEach(() => {
    UiActions.visitPermitsPage();
    UiActions.waitForTableLoad();
  });

  it('should display complete table structure with pagination and headers', () => {
    // Verify table structure exists
    cy.get(selector_shortcuts.table).should('be.visible');

    // Verify we have exactly 6 columns
    cy.get(`${selector_shortcuts.table} th[mat-header-cell]`).should(
      'have.length',
      EXPECTED_COLUMN_COUNT
    );

    // Verify all column headers are present with expected text
    cy.get(selector_shortcuts.headers.permitName).should(
      'contain.text',
      'Permit Name'
    );
    cy.get(selector_shortcuts.headers.applicantName).should(
      'contain.text',
      'Applicant Name'
    );
    cy.get(selector_shortcuts.headers.permitType).should(
      'contain.text',
      'Permit Type'
    );
    cy.get(selector_shortcuts.headers.status).should('contain.text', 'Status');
    cy.get(selector_shortcuts.headers.update).should('contain.text', 'Update');
    cy.get(selector_shortcuts.headers.delete).should('contain.text', 'Delete');

    // Verify pagination controls exist
    cy.get('mat-paginator').should('exist');
    cy.get('mat-paginator').should('contain.text', 'Items per page');

    // Verify action buttons in first row are functional
    cy.get(selector_shortcuts.permitRowUpdate(FIRST_ROW_INDEX))
      .find('button')
      .should('exist')
      .and('contain.text', 'Update')
      .and('not.be.disabled');

    cy.get(selector_shortcuts.permitRowDelete(FIRST_ROW_INDEX))
      .find('button')
      .should('exist')
      .and('contain.text', 'Delete')
      .and('not.be.disabled');

    // Verify application header and description
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

  it('should enforce default pagination with 10 items per page maximum', () => {
    // Verify first row exists (data loaded)
    cy.get(selector_shortcuts.permitRowName(FIRST_ROW_INDEX)).should(
      'be.visible'
    );

    // Count visible table rows should not exceed default page size
    cy.get(selector_shortcuts.table)
      .find('tr[mat-row]')
      .should('have.length.at.most', DEFAULT_PAGE_SIZE);

    // Verify 11th row doesn't exist (pagination working)
    cy.get(selector_shortcuts.permitRowName(ELEVENTH_ROW_INDEX)).should(
      'not.exist'
    );
  });

  it('should navigate between pages correctly and preserve data integrity', () => {
    // Store first page data for comparison
    let firstPageData: string;
    UiActions.getPermitNameFromRow(FIRST_ROW_INDEX).then((text) => {
      firstPageData = text;
    });

    // Test next/previous navigation
    UiActions.navigateToPage('next');
    UiActions.getPermitNameFromRow(FIRST_ROW_INDEX).then((nextPageData) => {
      expect(nextPageData).to.not.equal(firstPageData);
    });

    UiActions.navigateToPage('prev');
    UiActions.getPermitNameFromRow(FIRST_ROW_INDEX).then((backToFirstData) => {
      expect(backToFirstData).to.equal(firstPageData);
    });

    // Test first/last navigation
    UiActions.navigateToPage('last');
    UiActions.getPermitNameFromRow(FIRST_ROW_INDEX).then((lastPageData) => {
      expect(lastPageData).to.not.equal(firstPageData);
    });

    UiActions.navigateToPage('first');
    UiActions.getPermitNameFromRow(FIRST_ROW_INDEX).then(
      (returnToFirstData) => {
        expect(returnToFirstData).to.equal(firstPageData);
      }
    );
  });

  describe('Page Size Controls', () => {
    const setPageSize = (pageSize: number) => {
      cy.get('mat-paginator').find('mat-select').click({ force: true });
      cy.get('mat-option').contains(`${pageSize}`).click({ force: true });
      cy.wait(100); // Wait for table update
    };

    it('should dynamically adjust table rows based on page size selection', () => {
      // Test small page size (2 items)
      setPageSize(SMALL_PAGE_SIZE);

      cy.get(selector_shortcuts.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', MAX_VISIBLE_ROWS_SMALL);

      cy.get(selector_shortcuts.permitRowName(THIRD_ROW_INDEX)).should(
        'not.exist'
      );

      // Test medium page size (6 items)
      setPageSize(MEDIUM_PAGE_SIZE);

      cy.get(selector_shortcuts.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', MAX_VISIBLE_ROWS_MEDIUM);
    });

    it('should maintain page size selection during navigation', () => {
      setPageSize(SMALL_PAGE_SIZE);
      UiActions.navigateToPage('next');

      // Verify page size persists after navigation
      cy.get(selector_shortcuts.table)
        .find('tr[mat-row]')
        .should('have.length.at.most', MAX_VISIBLE_ROWS_SMALL);
    });
  });
});
