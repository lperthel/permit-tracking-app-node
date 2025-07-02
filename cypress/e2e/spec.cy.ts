import {
  APP_DESCRIPTION,
  APP_HEADER,
} from '../../src/app/assets/constants/app-description';

describe('Test landing page rendering and header', () => {
  it('Visits the initial landing page and test that the header and description render', () => {
    cy.visit('http://localhost:4200/');
    cy.contains(APP_HEADER.trim()).should('exist');
    cy.contains(APP_DESCRIPTION.trim()).should('exist');
  });
});
