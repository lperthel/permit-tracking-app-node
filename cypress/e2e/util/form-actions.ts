import { selectors } from './selectors';

export const fillProductForm = (
  name: string,
  desc: string,
  price: string,
  quantity: string
) => {
  cy.get(selectors.productForm.inputName).clear().type(name);
  cy.get(selectors.productForm.inputDesc).clear().type(desc);
  cy.get(selectors.productForm.inputPrice).clear().type(price);
  cy.get(selectors.productForm.inputQuantity).clear().type(quantity);
};
export const clickSubmitButton = () => clickButton('submit-button');
export const clickNewProductButton = () => clickButton('new-product-button');
export const clickButton = (dataTestId: string) => {
  cy.get(`[data-testid="${dataTestId}"]`).click({ force: true });
};
export const navigateToPaginationPage = (dataTestId: string) => {
  cy.get('mat-paginator[aria-label="Inventory table pagination controls"]')
    .find(`[data-testid="${dataTestId}"]`)
    .click({ force: true });
};
