export const selectors = {
  createButton: '[data-testid="create-button"]',
  refreshPermitsFromDbButton: 'refresh-products-from-db',
  permitForm: {
    inputPermitName: '[data-testid="input-name"]',
    inputApplicant: '[data-testid="input-description"]',
    inputPermitType: '[data-testid="input-price"]',
    inputStatus: '[data-testid="input-quantity"]',
    errorPermitName: '[data-testid="error-name"]',
    errorApplicantName: '[data-testid="error-description"]',
    errorPermitType: '[data-testid="error-price"]',
    errorPermitStatus: '[data-testid="error-quantity"]',
  },
  permitRowName: (index: number) =>
    `[data-testid="inventory-table-name-cell${index}"]`,
  permitRowApplicantName: (index: number) =>
    `[data-testid="inventory-table-description-cell${index}"]`,
  permitRowPermitType: (index: number) =>
    `[data-testid="inventory-table-price-cell${index}"]`,
  productRowStatus: (index: number) =>
    `[data-testid="inventory-table-quantity-cell${index}"]`,
  permitRowDelete: (index: number) =>
    `[data-testid="inventory-table-delete-cell${index}"]`,
  permitRowUpdate: (index: number) =>
    `[data-testid="inventory-table-update-cell${index}"]`,
};
