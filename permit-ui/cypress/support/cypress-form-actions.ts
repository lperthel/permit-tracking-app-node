import { selectors } from './cypress-selectors';

export const fillPermitForm = (
  permitName: string,
  applicantName: string,
  permitType: string,
  status: string
) => {
  cy.get(selectors.permitForm.inputPermitName).clear().type(permitName);
  cy.get(selectors.permitForm.inputApplicant).clear().type(applicantName);
  cy.get(selectors.permitForm.inputPermitType).clear().type(permitType);
  cy.get(selectors.permitForm.inputStatus).clear().type(status);
};

export const clearPermitForm = () => {
  cy.get(selectors.permitForm.inputPermitName).clear();
  cy.get(selectors.permitForm.inputApplicant).clear();
  cy.get(selectors.permitForm.inputPermitType).clear();
  cy.get(selectors.permitForm.inputStatus).clear();
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
