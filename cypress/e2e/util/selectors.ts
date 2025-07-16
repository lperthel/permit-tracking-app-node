export const selectors = {
  createButton: '[data-testid="create-button"]',
  productForm: {
    inputName: '[data-testid="input-name"]',
    inputDesc: '[data-testid="input-description"]',
    inputPrice: '[data-testid="input-price"]',
    inputQuantity: '[data-testid="input-quantity"]',
    errorName: '[data-testid="error-name"]',
    errorDesc: '[data-testid="error-description"]',
    errorPrice: '[data-testid="error-price"]',
    errorQuantity: '[data-testid="error-quantity"]',
  },
  productRowName: (index: number) =>
    `[data-testid="inventory-table-name-cell${index}"]`,
  productRowDesc: (index: number) =>
    `[data-testid="inventory-table-description-cell${index}"]`,
  productRowPrice: (index: number) =>
    `[data-testid="inventory-table-price-cell${index}"]`,
  productRowQuantity: (index: number) =>
    `[data-testid="inventory-table-quantity-cell${index}"]`,
};

export const paginationPage = {
  first: 'pagination-first',
  prev: 'pagination-prev',
  next: 'pagination-next',
  last: 'pagination-last',
};
