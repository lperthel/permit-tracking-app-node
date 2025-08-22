import { PermitStatus } from '../../src/app/permits/shared/models/permit-status.enums';
import { selector_shortcuts } from './cypress-selectors';

export const fillPermitForm = (
  permitName: string,
  applicantName: string,
  permitType: string,
  status: PermitStatus
) => {
  cy.get(selector_shortcuts.permitForm.inputPermitName)
    .clear()
    .type(permitName);
  cy.get(selector_shortcuts.permitForm.inputApplicant)
    .clear()
    .type(applicantName);
  cy.get(selector_shortcuts.permitForm.inputPermitType)
    .clear()
    .type(permitType);
  // Use select() for dropdown instead of type()
  cy.get(selector_shortcuts.permitForm.inputStatus).select(status);
};

export const clearPermitForm = () => {
  cy.get(selector_shortcuts.permitForm.inputPermitName).clear();
  cy.get(selector_shortcuts.permitForm.inputApplicant).clear();
  cy.get(selector_shortcuts.permitForm.inputPermitType).clear();
  // For dropdown, we can't select disabled empty option
  // For validation testing, we'll rely on the form's initial empty state
  // or the test can explicitly trigger validation without clearing status
};

export const clearPermitFormForUpdate = () => {
  // Clear text fields normally
  cy.get(selector_shortcuts.permitForm.inputPermitName).clear();
  cy.get(selector_shortcuts.permitForm.inputApplicant).clear();
  cy.get(selector_shortcuts.permitForm.inputPermitType).clear();

  // For the status dropdown, use Cypress invoke to call Angular's form control directly
  cy.get(selector_shortcuts.permitForm.inputStatus)
    .invoke('val', '')
    .trigger('change')
    .trigger('blur');
};

export const clickSubmitButton = () => clickButton('submit-button');
export const clickNewPermitButton = () => clickButton('new-permit-button'); // Updated from product
export const clickModalCloseButton = () => clickButton('modal-close-button');

export const clickButton = (dataTestId: string) => {
  cy.get(`[data-testid="${dataTestId}"]`).click({ force: true });
};

export const navigateToPaginationPage = (dataTestId: string) => {
  cy.get('mat-paginator[aria-label="Permit table pagination controls"]') // Updated from Inventory
    .find(`[data-testid="${dataTestId}"]`)
    .click({ force: true });
};
