// ============================================================================
// ui-assertions.ts - All UI verification and validation
// ============================================================================

import { AllPermitsComponentConstants } from '../../src/app/permits/pages/all-permits/all-permits-component.constants';
import { PERMIT_FORM_SELECTORS } from '../../src/app/permits/permit-form-model/permit-form.constants';
import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../src/app/permits/shared/models/permit.model';
import {
  PermitFixtureKeys,
  PermitFixtures,
} from '../fixtures/permits/permit-fixtures';
import { getTestSelector, selector_shortcuts } from './cypress-selectors';
import { UiActions } from './ui-actions';

export class UiAssertions {
  /**
   * Verifies permit data appears in table at specific row
   */
  static verifyPermitInTable(permit: Partial<Permit>, rowIndex = 0): void {
    if (permit.permitName) {
      cy.get(selector_shortcuts.permitRowName(rowIndex)).should(
        'contain.text',
        permit.permitName
      );
    }
    if (permit.applicantName) {
      cy.get(selector_shortcuts.permitRowApplicantName(rowIndex)).should(
        'contain.text',
        permit.applicantName
      );
    }
    if (permit.permitType) {
      cy.get(selector_shortcuts.permitRowPermitType(rowIndex)).should(
        'contain.text',
        permit.permitType
      );
    }
    if (permit.status) {
      cy.get(selector_shortcuts.permitRowStatus(rowIndex)).should(
        'contain.text',
        permit.status
      );
    }
  }

  /**
   * Verifies permit from fixture appears in table
   */
  static verifyFixturePermitInTable(
    fixtureName: PermitFixtureKeys,
    rowIndex = 0
  ): void {
    PermitFixtures.getPermitFormData(fixtureName).then((permitData) => {
      this.verifyPermitInTable(
        {
          permitName: permitData.permitName,
          applicantName: permitData.applicantName,
          permitType: permitData.permitType,
          status: permitData.status as PermitStatus,
        },
        rowIndex
      );
    });
  }

  /**
   * Verifies form validation errors
   */
  static verifyFormError(
    field: 'permitName' | 'applicantName' | 'permitType' | 'status',
    expectedMessage?: string
  ): void {
    const errorSelectors = {
      permitName: selector_shortcuts.permitForm.errorPermitName,
      applicantName: selector_shortcuts.permitForm.errorApplicantName,
      permitType: selector_shortcuts.permitForm.errorPermitType,
      status: selector_shortcuts.permitForm.errorPermitStatus,
    };

    cy.get(errorSelectors[field]).should('be.visible');
    if (expectedMessage) {
      cy.get(errorSelectors[field]).should('contain.text', expectedMessage);
    }
  }

  /**
   * Verifies loading states
   */
  static verifyButtonLoading(buttonSelector: string): void {
    cy.get(buttonSelector).should('be.disabled');
    cy.get(buttonSelector).should('contain.text', 'Submitting...');
  }

  static verifyButtonEnabled(buttonSelector: string): void {
    cy.get(buttonSelector).should('not.be.disabled');
  }

  /**
   * Gets table row count
   */
  static getTableRowCount(): Cypress.Chainable<number> {
    return cy.get(selector_shortcuts.table).find('tbody tr').its('length');
  }

  /**
   * Verifies empty state
   */
  static verifyEmptyState(): void {
    const EMPTY_STATE_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.EMPTY_STATE_ALERT
    );

    // Table should still be visible (headers shown) but with empty state message
    cy.get(selector_shortcuts.table).should('be.visible');
    cy.get(EMPTY_STATE_SELECTOR).should('be.visible');
    cy.get(EMPTY_STATE_SELECTOR).should(
      'contain.text',
      AllPermitsComponentConstants.UI_TEXT.NO_PERMITS_FOUND
    );

    // Verify no data rows exist (only headers)
    cy.get(`${selector_shortcuts.table} tbody tr`).should('have.length', 0);
  }

  /**
   * Verifies loading state elements
   */
  static verifyAllPermitsLoadingState(): void {
    const LOADING_SPINNER_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER
    );
    const LOADING_SPINNER_TEXT_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER_TEXT
    );

    cy.get(LOADING_SPINNER_SELECTOR).should('exist');
    cy.get(LOADING_SPINNER_TEXT_SELECTOR).should(
      'contain.text',
      AllPermitsComponentConstants.UI_TEXT.LOADING_MESSAGE
    );
  }

  /**
   * Verifies loading accessibility
   */
  static verifyAllPermitsLoadingAccessibility(): void {
    const LOADING_SPINNER_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.LOADING_SPINNER
    );
    cy.get(LOADING_SPINNER_SELECTOR)
      .find('.spinner-border')
      .should('have.attr', 'role', 'status');
  }

  /**
   * Verifies error messages
   */
  static verifyAllPermitsErrorMessage(message: string): void {
    const ERROR_ALERT_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.REST_ERROR_ALERT
    );
    cy.get(ERROR_ALERT_SELECTOR).should('be.visible');
    cy.get(ERROR_ALERT_SELECTOR).should('contain.text', message);
  }

  /**
   * Verifies form validation errors have proper ARIA attributes
   */
  static verifyValidationErrorAccessibility(): void {
    // Check that validation error messages are announced to screen readers
    cy.get(selector_shortcuts.permitForm.errorPermitName)
      .should('be.visible')
      .and('have.attr', 'role', 'alert');

    cy.get(selector_shortcuts.permitForm.errorApplicantName)
      .should('be.visible')
      .and('have.attr', 'role', 'alert');

    // Add checks for other validation errors as needed
  }

  /**
   * Verifies REST error messages have proper ARIA attributes
   */
  static verifyRestErrorAccessibility(): void {
    const REST_ERROR_SELECTOR = getTestSelector(
      PERMIT_FORM_SELECTORS.REST_ERROR
    );

    cy.get(REST_ERROR_SELECTOR)
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'assertive');
  }

  /**
   * Verifies no error state
   */
  static verifyAllPermitsNoError(): void {
    const ERROR_ALERT_SELECTOR = getTestSelector(
      AllPermitsComponentConstants.TEST_IDS.REST_ERROR_ALERT
    );
    cy.get(ERROR_ALERT_SELECTOR).should('not.exist');
  }

  /**
   * Verifies form field exists with proper label
   */
  static verifyPermitFormFieldExists(
    field: 'permitName' | 'applicantName' | 'permitType' | 'status'
  ): void {
    const fieldSelectors = {
      permitName: selector_shortcuts.permitForm.inputPermitName,
      applicantName: selector_shortcuts.permitForm.inputApplicant,
      permitType: selector_shortcuts.permitForm.inputPermitType,
      status: selector_shortcuts.permitForm.inputStatus,
    };

    const labelTexts = {
      permitName: 'Permit Name*',
      applicantName: 'Applicant Name*',
      permitType: 'Permit Type*',
      status: 'Status*',
    };

    // Verify field exists
    cy.get(fieldSelectors[field]).should('exist');

    // Verify associated label exists
    cy.contains('label', labelTexts[field]).should('exist');
  }

  /**
   * Verifies main page is visible after modal close
   */
  static verifyMainPageVisible(): void {
    cy.get(selector_shortcuts.table).should('be.visible');
    cy.get(selector_shortcuts.createButton).should('be.visible');
  }

  /**
   * Verifies no form errors are present
   */
  static verifyNoPermitFormErrors(): void {
    cy.get(selector_shortcuts.permitForm.errorPermitName).should('not.exist');
    cy.get(selector_shortcuts.permitForm.errorApplicantName).should(
      'not.exist'
    );
    cy.get(selector_shortcuts.permitForm.errorPermitType).should('not.exist');
    cy.get(selector_shortcuts.permitForm.errorPermitStatus).should('not.exist');
  }

  /**
   * Verifies no form error for specific field
   */
  static verifyNoPermitFormError(
    field: 'permitName' | 'applicantName' | 'permitType' | 'status'
  ): void {
    const errorSelectors = {
      permitName: selector_shortcuts.permitForm.errorPermitName,
      applicantName: selector_shortcuts.permitForm.errorApplicantName,
      permitType: selector_shortcuts.permitForm.errorPermitType,
      status: selector_shortcuts.permitForm.errorPermitStatus,
    };

    cy.get(errorSelectors[field]).should('not.exist');
  }

  /**
   * Verifies status dropdown contains all expected options
   */
  static verifyStatusDropdownOptions(expectedStatuses: PermitStatus[]): void {
    cy.get(selector_shortcuts.permitForm.inputStatus)
      .find('option')
      .then(($options) => {
        const values = [...$options]
          .map((option) => option.value)
          .filter((value) => value !== '');

        expectedStatuses.forEach((status) => {
          expect(values).to.include(status);
        });
      });
  }

  /**
   * Verifies form data matches expected values
   */
  static verifyPermitFormData(expectedData: {
    permitName: string;
    applicantName: string;
    permitType: string;
    status: PermitStatus;
  }): void {
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'have.value',
      expectedData.permitName
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'have.value',
      expectedData.applicantName
    );
    cy.get(selector_shortcuts.permitForm.inputPermitType).should(
      'have.value',
      expectedData.permitType
    );
    cy.get(selector_shortcuts.permitForm.inputStatus).should(
      'have.value',
      expectedData.status
    );
  }

  /**
   * Verifies form is cleared (all fields empty)
   */
  static verifyFormCleared(): void {
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'have.value',
      ''
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'have.value',
      ''
    );
    cy.get(selector_shortcuts.permitForm.inputPermitType).should(
      'have.value',
      ''
    );
    cy.get(selector_shortcuts.permitForm.inputStatus).should(
      'satisfy',
      ($select) => {
        const value = $select.val();
        return value === '' || value === null; // Accept either empty string or null
      }
    );
  }

  /**
   * Verifies keyboard navigation works properly
   */
  static verifyKeyboardNavigation(): void {
    // Verify tab order flows logically through form fields
    cy.get(selector_shortcuts.permitForm.inputPermitName).should('be.focused');

    // Tab to next field and verify focus
    cy.tab();
    cy.get(selector_shortcuts.permitForm.inputApplicant).should('be.focused');

    cy.tab();
    cy.get(selector_shortcuts.permitForm.inputPermitType).should('be.focused');

    cy.tab();
    cy.get(selector_shortcuts.permitForm.inputStatus).should('be.focused');

    cy.tab();
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON)).should(
      'be.focused'
    );
  }

  /**
   * Verifies ARIA labels and accessibility attributes
   */
  static verifyAriaLabels(): void {
    // Verify form has proper ARIA attributes
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM))
      .should('have.attr', 'role')
      .and('match', /form|main/);

    // Verify modal has proper ARIA labeling
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'have.attr',
      'aria-labelledby'
    );
  }

  /**
   * Verifies form accessibility compliance
   */
  static verifyFormAccessibility(): void {
    // Verify all inputs have associated labels
    cy.get(selector_shortcuts.permitForm.inputPermitName).should(
      'have.attr',
      'id'
    );
    cy.get(selector_shortcuts.permitForm.inputApplicant).should(
      'have.attr',
      'id'
    );
    cy.get(selector_shortcuts.permitForm.inputPermitType).should(
      'have.attr',
      'id'
    );
    cy.get(selector_shortcuts.permitForm.inputStatus).should('have.attr', 'id');

    // Verify required fields are marked
    cy.contains('label', 'Permit Name*').should('exist');
    cy.contains('label', 'Applicant Name*').should('exist');
    cy.contains('label', 'Permit Type*').should('exist');
    cy.contains('label', 'Status*').should('exist');
  }

  /**
   * Verifies validation styling (CSS classes for errors)
   */
  static verifyValidationStyling(): void {
    // Check that error fields have appropriate styling classes
    cy.get(selector_shortcuts.permitForm.errorPermitName)
      .should('have.class', 'lp-control-error')
      .and('be.visible');
  }

  /**
   * Verifies professional styling consistency
   */
  static verifyProfessionalStyling(): void {
    // Verify modal has Bootstrap classes
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.MODAL_HEADER)).should(
      'have.class',
      'modal-header'
    );

    // Verify form uses Bootstrap validation classes
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.PERMIT_FORM)).should(
      'have.class',
      'needs-validation'
    );

    // Verify buttons have proper Bootstrap styling
    cy.get(getTestSelector(PERMIT_FORM_SELECTORS.SUBMIT_BUTTON))
      .should('have.class', 'btn')
      .and('have.class', 'btn-outline-secondary');
  }

  /**
   * Verifies that a permit from fixtures appears in the last row of the table
   * @param fixtureName - The fixture key to verify
   */
  static verifyFixturePermitInLastRow(fixtureName: PermitFixtureKeys): void {
    UiActions.getLastRowIndex().then((lastIndex) => {
      this.verifyFixturePermitInTable(fixtureName, lastIndex);
    });
  }
}
