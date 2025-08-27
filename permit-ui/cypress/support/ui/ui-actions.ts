// ============================================================================
// ui-actions.ts - All UI interactions (forms, buttons, navigation)
// ============================================================================
import { AllPermitsComponentConstants } from '../../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../../src/app/permits/shared/models/permit-status.enums';
import { dev_env } from '../../../src/environments/environment';
import {
  InvalidPermitFixtureKeys,
  PermitFixtureKeys,
  PermitFixtures,
} from '../../fixtures/permits/permit-fixtures';
import { getTestSelector, selector_shortcuts } from './cypress-selectors';

export class UiActions {
  /**
   * Clears all permit form fields
   */
  static clearPermitForm(): void {
    cy.get(selector_shortcuts.permitForm.inputPermitName).clear();
    cy.get(selector_shortcuts.permitForm.inputApplicant).clear();
    cy.get(selector_shortcuts.permitForm.inputPermitType).clear();
    // Reset dropdown to empty state
    cy.get(selector_shortcuts.permitForm.inputStatus)
      .invoke('val', '')
      .trigger('change')
      .trigger('blur');
  }

  /**
   * Fills permit form with specific data
   */
  static fillPermitForm(
    permitName: string,
    applicantName: string,
    permitType: string,
    status: PermitStatus | string
  ): void {
    // Clear all fields first
    this.clearPermitForm();

    // Only type if the value is not empty
    if (permitName.trim()) {
      cy.get(selector_shortcuts.permitForm.inputPermitName).type(permitName);
    }

    if (applicantName.trim()) {
      cy.get(selector_shortcuts.permitForm.inputApplicant).type(applicantName);
    }

    if (permitType.trim()) {
      cy.get(selector_shortcuts.permitForm.inputPermitType).type(permitType);
    }

    // For status, only select if it's a valid non-empty value
    if (status?.trim()) {
      cy.get(selector_shortcuts.permitForm.inputStatus).select(status);
    }
  }
  /**
   * Fills permit form using fixture data
   */
  static fillPermitFormFromFixture(fixtureName: PermitFixtureKeys): void {
    PermitFixtures.getPermitFormData(fixtureName).then((permitData) => {
      this.fillPermitForm(
        permitData.permitName,
        permitData.applicantName,
        permitData.permitType,
        permitData.status as PermitStatus
      );
    });
  }

  /**
   * Clicks various UI buttons
   */
  static clickNewPermitButton(): void {
    cy.get(selector_shortcuts.createButton).click();
  }

  /**
   * Clicks update button for a specific permit to open update modal
   * This is specifically for modal testing workflow
   */
  static clickUpdatePermitButton(rowIndex = 0): void {
    cy.get(selector_shortcuts.permitRowUpdate(rowIndex)).find('button').click();
    // Wait a moment for modal to open
    cy.wait(500);
  }

  static clickSubmitButton(): void {
    cy.get(`[data-testid="${PERMIT_FORM_SELECTORS.SUBMIT_BUTTON}"]`).click({
      force: true,
    });
  }

  static clickModalCloseButton(): void {
    cy.get(`[data-testid="${PERMIT_FORM_SELECTORS.MODAL_CLOSE_BUTTON}"]`).click(
      { force: true }
    );
  }

  static clickRefreshButton(): void {
    cy.get(selector_shortcuts.refreshPermitsFromDbButton).click();
  }

  /**
   * Gets the index of the last row in the permits table
   * @returns Promise resolving to the last row index (0-based)
   */
  static getLastRowIndex(): Cypress.Chainable<number> {
    return cy
      .get(selector_shortcuts.table)
      .find('tbody tr')
      .then(($rows) => {
        return $rows.length - 1;
      });
  }

  /**
   * Navigation helpers
   */
  static navigateToPage(page: 'first' | 'last' | 'next' | 'prev'): void {
    cy.get(selector_shortcuts.pagination[page]).click({ force: true });
    this.waitForTableLoad();
  }

  static visitPermitsPage(): void {
    cy.visit(dev_env.uiUrl);
    cy.wait(1000);
  }

  /**
   * Wait helpers
   */
  static waitForTableLoad(): void {
    cy.get(selector_shortcuts.table).should('exist');
    cy.get(selector_shortcuts.permitRowName(0)).should('exist');
  }

  static waitForPermitCount(expectedCount: number): void {
    cy.get(selector_shortcuts.table)
      .find('tbody tr')
      .should('have.length', expectedCount);
  }

  /**
   * Wait for loading spinner to appear
   */
  static waitForAllPermitsLoadingSpinner(): void {
    const LOADING_SPINNER_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER
    );
    cy.get(LOADING_SPINNER_SELECTOR, { timeout: 2000 }).should('exist');
  }

  /**
   * Wait for loading to complete (spinner disappears)
   */
  static waitForAllPermitsLoadingToComplete(): void {
    const LOADING_SPINNER_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER
    );
    cy.get(LOADING_SPINNER_SELECTOR).should('not.exist');
  }

  /**
   * Finds a permit row by permit name and returns the row element
   * Useful for test isolation when working with specific test permits
   */
  static findPermitRowByName(
    permitName: string
  ): Cypress.Chainable<JQuery<HTMLTableRowElement>> {
    return cy.contains('td', permitName).parent('tr');
  }

  /**
   * Clicks delete button for a specific permit by row index
   * More reliable than searching by name
   */
  static deletePermitByIndex(rowIndex: number): void {
    cy.get(
      `[data-testid="${AllPermitsComponentConstants.TEST_IDS.DELETE_CELL(
        rowIndex
      )}"]`
    )
      .find('button')
      .click();
  }

  /**
   * Clicks update button for a specific permit by row index
   * More reliable than searching by name
   */
  static updatePermitByIndex(rowIndex: number): void {
    cy.get(
      `[data-testid="${AllPermitsComponentConstants.TEST_IDS.UPDATE_CELL(
        rowIndex
      )}"]`
    )
      .find('button')
      .click();
  }

  /**
   * Gets the permit name from a specific row
   * Useful for verification after operations
   */
  static getPermitNameFromRow(rowIndex: number): Cypress.Chainable<string> {
    return cy
      .get(
        `[data-testid="${AllPermitsComponentConstants.TEST_IDS.PERMIT_NAME_CELL(
          rowIndex
        )}"]`
      )
      .invoke('text')
      .then((text) => text.trim());
  }

  /**
   * Gets the current number of permits in the table
   */
  static getPermitCount(): Cypress.Chainable<number> {
    return cy.get('[data-testid*="permit-name-cell"]').its('length');
  }

  /**
   * Fills permit form using invalid fixture data for validation testing
   */
  static fillPermitFormFromInvalidFixture(
    fixtureName: InvalidPermitFixtureKeys
  ): void {
    PermitFixtures.loadInvalidPermits().then((invalidPermits) => {
      const permitData = invalidPermits[fixtureName];
      this.fillPermitForm(
        permitData.permitName || '',
        permitData.applicantName || '',
        permitData.permitType || '',
        (permitData.status as PermitStatus) || ''
      );
    });
  }

  /**
   * Tabs through form fields in logical order
   */
  static tabThroughFormFields(): void {
    // Start by focusing first field
    cy.get(selector_shortcuts.permitForm.inputPermitName).focus();

    // Tab through each field
    cy.tab();
    cy.tab();
    cy.tab();
    cy.tab(); // Should end on submit button
  }

  /**
   * Clears a specific form field
   */
  static clearFormField(
    field: 'permitName' | 'applicantName' | 'permitType' | 'status'
  ): void {
    const fieldSelectors = {
      permitName: selector_shortcuts.permitForm.inputPermitName,
      applicantName: selector_shortcuts.permitForm.inputApplicant,
      permitType: selector_shortcuts.permitForm.inputPermitType,
      status: selector_shortcuts.permitForm.inputStatus,
    };

    if (field === 'status') {
      // Reset dropdown to empty state
      cy.get(fieldSelectors[field])
        .invoke('val', '')
        .trigger('change')
        .trigger('blur');
    } else {
      cy.get(fieldSelectors[field]).clear();
    }
  }

  /**
   * Types text into specific form fields
   */
  static typeInPermitNameField(value: string): void {
    cy.get(selector_shortcuts.permitForm.inputPermitName).type(value);
  }

  static typeInApplicantNameField(value: string): void {
    cy.get(selector_shortcuts.permitForm.inputApplicant).type(value);
  }

  static typeInPermitTypeField(value: string): void {
    cy.get(selector_shortcuts.permitForm.inputPermitType).type(value);
  }

  static selectStatus(status: string): void {
    cy.get(selector_shortcuts.permitForm.inputStatus).select(status);
  }
}
