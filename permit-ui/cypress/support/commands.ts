// cypress/support/commands.ts
import 'cypress-plugin-tab';

declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
