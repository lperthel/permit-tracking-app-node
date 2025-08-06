export const PERMIT_FORM_ERRORS = {
  invalidName:
    'Name is required and must be less than or equal to 50 characters',
  invalidDescription:
    'Description is required and must be less than 256 characters',
  invalidPrice:
    'Price is required, must be less than 256 characters, and follow the formatting of USD.',
  invalidQuantity:
    'Quantity is required, must be less than 256 characters, and must be numeric',
};

export const PERMIT_FORM_HEADERS = {
  newPermit: 'New Permit',
  updatePermit: 'Update Permit',
};

export const PERMIT_FORM_CONSTRAINTS = {
  nameMaxLength: 50,
  descMaxLength: 1000,
  priceMaxLength: 255,
  quantityMax: 255,
};
