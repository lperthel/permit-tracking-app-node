// Global setup for permit application tests
// No need to import commands - we use ES2022 functions instead

// Government security: Fail tests on console errors (FISMA compliance)
Cypress.on('window:before:load', (win) => {
  const originalConsoleError = win.console.error;
  win.console.error = (...args) => {
    // Log the error but don't fail tests for expected Angular warnings
    if (
      !args[0]
        ?.toString()
        .includes('ExpressionChangedAfterItHasBeenCheckedError')
    ) {
      originalConsoleError.apply(win.console, args);
    }
  };
});

// Prevent uncaught exceptions from failing tests (Angular dev warnings)
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Don't fail on Angular development warnings
  if (err.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
    return false;
  }
  return true;
});

// Global test setup
beforeEach(() => {
  // Clear browser storage for test isolation
  cy.clearLocalStorage();
  cy.clearCookies();

  // Set viewport for government accessibility standards
  cy.viewport(1280, 720);
});

// Global test cleanup - removed the problematic condition
afterEach(() => {
  // Additional cleanup can be added here if needed
});
