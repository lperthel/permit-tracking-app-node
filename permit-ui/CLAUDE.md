# Permit UI - Frontend Codebase Guide for Claude

## 📋 Project Overview

This is the frontend Angular application for a **permit tracking system prototype** focused on government-ready CRUD operations, input validation, and error handling. The application is designed for **simplicity and reliability** rather than advanced features.

### Current Scope

- **IN SCOPE**: Basic CRUD operations, input validation, error handling, loading states
- **NOT IN SCOPE**: Status transitions, bulk operations, concurrency handling, advanced accessibility testing, advanced features

### Tech Stack

- **Framework**: Angular 19 with TypeScript
- **UI**: Bootstrap 5 + Angular Material
- **Testing**: Cypress E2E (comprehensive) + Karma/Jasmine (unit)
- **Backend Mock**: JSON Server for development
- **Future Backend**: Spring Boot 3.x + PostgreSQL

## 🏗️ Established Patterns & Architecture

### Centralized Helper Classes Pattern

The codebase follows a **centralized helper class architecture** for testing that eliminates code duplication and ensures consistency:

#### Core Testing Classes

- **`UiActions`**: All UI interactions (form filling, button clicks, navigation)
- **`UiAssertions`**: All UI verification and validation
- **`ApiActions`**: API operations for test setup and cleanup
- **`ApiIntercepts`**: Centralized API mocking with fixtures
- **`PermitFixtures`**: Type-safe test data management

#### Anti-Patterns to Avoid

❌ **Never** use direct Cypress commands in tests:

- No `cy.get()` directly - use `UiActions` methods
- No `cy.intercept()` directly - use `ApiIntercepts` class
- No hardcoded test data - use `PermitFixtures` class
- No direct API calls in tests - use `ApiActions` class

✅ **Always** use centralized helper classes:

```typescript
// Good
UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
UiActions.clickSubmitButton();
UiAssertions.verifyFixturePermitInTable(PermitFixtureKeys.CREATE_THIS_PERMIT);

// Bad
cy.get('[data-testid="input-permit-name"]').type("Some Name");
cy.get('[data-testid="permit-form-submit-button"]').click();
cy.get('[data-testid="permit-name-cell-0"]').should("contain.text", "Some Name");
```

### Type-Safe Fixture Management

All test data uses **enum-based keys** for type safety:

```typescript
// Fixture Keys (Type-Safe)
enum PermitFixtureKeys {
  CREATE_THIS_PERMIT = "createThisPermit",
  DELETE_TEST_PERMIT = "deleteTestPermit",
  UPDATE_TEST_PERMIT_BEFORE = "updateTestPermitBefore",
  UPDATE_TEST_PERMIT_AFTER = "updateTestPermitAfter",
}

// API Testing Enums
enum ApiOperation {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  GET_LIST = "getList",
}

enum ApiErrorType {
  SERVER_ERROR = "serverError",
  NETWORK_ERROR = "networkError",
  NOT_FOUND = "notFound",
  BAD_REQUEST = "badRequest",
}
```

## 📁 File Structure & Organization

### Source Code Structure

```
src/app/
├── permits/
│   ├── components/
│   │   └── permit-form/              # Reusable form component
│   ├── pages/
│   │   ├── all-permits/              # Main permit list page
│   │   ├── new-permit/               # Create permit page
│   │   └── update-permit/            # Update permit page
│   ├── permit-form-model/            # Form constants and validation
│   └── shared/
│       ├── models/                   # Data models and enums
│       └── services/                 # API services and validation
└── assets/constants/                 # Global constants and test data
```

### Test Structure

```
cypress/
├── e2e/
│   ├── infrastructure/               # Infrastructure tests (fixture validation)
│   └── permits/
│       ├── all-permits-page/         # All permits page tests
│       ├── new-permit-page/          # New permit page tests
│       └── update-permit-page/       # Update permit page tests
├── fixtures/
│   ├── permits/                      # Test permit data
│   └── api-responses/                # API response mocks
└── support/
    ├── api/                          # API testing utilities
    ├── ui/                           # UI testing utilities
    └── test-setup/                   # Test setup helpers
```

### Test File Naming Conventions

- **CRUD Operations**: `*-crud.spec.cy.ts`
- **Validation Testing**: `*-validation-behavior.spec.cy.ts`
- **Error Handling**: `*-error-scenarios.spec.cy.ts` or `*-errors.spec.cy.ts`
- **Modal Behavior**: `*-modal-behavior.spec.cy.ts`
- **Loading States**: `*-loading-states.spec.cy.ts`
- **Network Errors**: `*-network-errors.spec.cy.ts`

### When to Split vs Consolidate Files

- **Split** when tests exceed ~200 lines or test fundamentally different workflows
- **Consolidate** related error scenarios into single files
- **Separate** loading state tests from CRUD tests
- **Group** validation tests by form/component

## 🧩 Domain Model

### Permit Data Structure

```typescript
interface Permit {
  id: string; // UUID generated by backend
  permitName: string; // Required, max 100 chars
  applicantName: string; // Required, max 100 chars
  permitType: string; // Required, max 50 chars
  status: PermitStatus; // Required enum value
}

enum PermitStatus {
  SUBMITTED = "SUBMITTED",
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}
```

### Validation Rules

- **Pattern**: Only letters, numbers, spaces, dashes, apostrophes, commas, periods
- **Length**: permitName (100), applicantName (100), permitType (50)
- **Required**: All fields are required
- **Status**: Must be valid enum value

### User Workflows

1. **Create Permit**: Fill form → Submit → Verify in table
2. **View Permits**: Navigate pages → Sort/filter → View details
3. **Update Permit**: Select permit → Modify form → Submit → Verify changes
4. **Delete Permit**: Select permit → Confirm deletion → Verify removal

## 🛠️ Development Workflow

### Common Commands

```bash
# Development server
npm start                    # Angular dev server (http://localhost:4200)
npm run gs                   # Generate test data + JSON server

# Testing
npm run cy:open              # Cypress GUI with recording
npm run cy:run               # Cypress headless with recording
npm run cy:ci                # Cypress CI mode (no recording)
npm run karma:coverage       # Unit test coverage
npm run test:all             # Run all tests

# Linting & Building
npm run lint                 # ESLint check
npm run build               # Production build
```

### Test Data Management

- **Valid Permits**: `cypress/fixtures/permits/valid-permits.json`
- **Invalid Permits**: `cypress/fixtures/permits/invalid-permits.json`
- **API Responses**: `cypress/fixtures/api-responses/` (success, error, loading)

### Error Simulation Patterns

```typescript
// Network Errors
ApiIntercepts.interceptGetPermitsWithError(ApiErrorType.NETWORK_ERROR);

// Loading States
ApiIntercepts.interceptGetPermitsWithLoading(ApiLoadingType.SLOW);

// Server Errors
ApiIntercepts.interceptCreatePermitWithError(ApiErrorType.SERVER_ERROR);
```

## 🧪 Testing Standards

### Describe Block Patterns

```typescript
describe("Page/Component Name - Test Category", () => {
  describe("Specific Functionality", () => {
    it("should perform specific behavior with expected outcome", () => {
      // Test implementation
    });
  });
});
```

### Test Structure Template

```typescript
it("should [action] and [expected result]", () => {
  // 1. Setup (visit page, intercepts, initial state)
  UiActions.visitPermitsPage();
  ApiIntercepts.interceptCreatePermit();

  // 2. Action (user interactions)
  UiActions.clickNewPermitButton();
  UiActions.fillPermitFormFromFixture(PermitFixtureKeys.CREATE_THIS_PERMIT);
  UiActions.clickSubmitButton();

  // 3. Verification (assert expected outcomes)
  UiAssertions.verifyFixturePermitInTable(PermitFixtureKeys.CREATE_THIS_PERMIT);
});
```

### Test Isolation Requirements

- Each test must create its own data via API calls
- Tests should not depend on execution order
- Clean up test data after test completion
- Use fixtures for consistent test data

## 🚀 Recent Improvements

### Refactor Agent Integration

This codebase is maintained by a **refactor agent** that enforces:

- Centralized helper class usage
- Type-safe fixture management
- Consistent test patterns
- Professional documentation standards

### Recent Consolidation Work

- **Merged** scattered validation tests into focused files
- **Extracted** shared utilities into centralized classes
- **Standardized** API intercept patterns
- **Improved** error handling and recovery testing

### Key Technical Fixes

- Fixed Cypress intercept delay handling
- Implemented proper test isolation patterns
- Corrected Cypress assertion patterns
- Centralized all UI interactions and verifications

## 🎯 Working Effectively

### Before Making Changes

1. **Read existing helper classes** to understand available methods
2. **Check fixture structure** for available test data
3. **Review similar tests** for established patterns
4. **Use enum keys** instead of hardcoded strings

### When Adding New Tests

1. **Use centralized helpers** - never write direct Cypress commands
2. **Follow naming conventions** for test files and describe blocks
3. **Create focused test files** - split when tests become unrelated
4. **Document test purpose** with government-ready comments

### When Adding New Features

1. **Extend existing helpers** rather than creating new ones
2. **Add new fixtures** with corresponding enum keys
3. **Update type definitions** to maintain type safety
4. **Follow established patterns** for consistency

## 🔧 Key Files to Know

### Testing Infrastructure

- `cypress/support/ui/ui-actions.ts` - All UI interactions
- `cypress/support/ui/ui-assertions.ts` - All verifications
- `cypress/support/api/api-intercepts.ts` - API mocking
- `cypress/fixtures/permits/permit-fixtures.ts` - Test data management
- `cypress/support/api/api-actions.ts` - Calls backend apis to CRUD permits.

### Domain Models

- `src/app/permits/shared/models/permit.model.ts` - Core data structure
- `src/app/permits/shared/models/permit-status.enums.ts` - Status values
- `src/app/permits/permit-form-model/permit-form.constants.ts` - Form validation

### Configuration

- `package.json` - All npm scripts and dependencies
- `cypress.config.ts` - Cypress configuration
- `angular.json` - Angular build configuration

This guide should enable any Claude session to immediately understand and work effectively within the established patterns of this government-ready permit tracking application.
