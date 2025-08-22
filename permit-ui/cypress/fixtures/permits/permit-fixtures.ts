// ============================================================================
// permit-fixtures.ts - Centralized Test Data Management
// ============================================================================

/**
 * Permit Fixture Helper for Centralized Test Data Management
 *
 * PURPOSE:
 * - Provides type-safe access to all permit test data
 *
 */

import { v4 as uuidv4 } from 'uuid';
import { PermitStatus } from '../../../src/app/permits/shared/models/permit-status.enums';
import { Permit } from '../../../src/app/permits/shared/models/permit.model';

/**
 * Permit Test Data Management Class
 *
 * USAGE PATTERNS:
 * 1. Form Testing: Use getPermitFormData() for UI form filling
 * 2. API Testing: Use getValidPermit() for complete objects with IDs
 * 3. Batch Operations: Use getMultiplePermits() for pagination testing
 * 4. Validation Testing: Use getInvalidPermitFormData() for error scenarios
 *
 */
export class PermitFixtures {
  // ============================================================================
  // FIXTURE LOADING METHODS - Raw data access
  // ============================================================================

  /**
   * Loads all valid permit test data from JSON fixture
   *
   * USAGE: For accessing multiple permit scenarios in a single test
   *
   * @returns Promise resolving to typed valid permit collection
   * @example
   * PermitFixtures.loadValidPermits().then(permits => {
   *   // Access permits.createThisPermit, permits.deleteTestPermit, etc.
   * });
   */
  static loadValidPermits() {
    return cy.fixture(
      'permits/valid-permits.json'
    ) as Cypress.Chainable<ValidPermits>;
  }

  /**
   * Loads invalid permit data for validation testing
   *
   * IMPLEMENTATION: Contains test cases for:
   * - Missing required fields
   * - Invalid character sets
   * - Field length violations
   * - Invalid status values
   *
   * @returns Promise resolving to typed invalid permit collection
   */
  static loadInvalidPermits(): Cypress.Chainable<InvalidPermits> {
    return cy.fixture(
      'permits/invalid-permits.json'
    ) as Cypress.Chainable<InvalidPermits>;
  }

  // ============================================================================
  // PERMIT OBJECT GENERATION - Complete objects with IDs
  // ============================================================================

  /**
   * Gets a complete permit object with generated UUID
   *
   * PURPOSE: Creates realistic permit objects for API testing and database simulation
   *
   * REALISTIC DATA SIMULATION:
   * - Generates unique UUID for each permit (simulates database primary key)
   * - Properly types status enum to prevent runtime errors
   * - Returns complete Permit model matching Angular/Spring Boot structure
   *
   * @param permitName - Name of the permit scenario from valid-permits.json
   * @returns Promise resolving to complete Permit object with ID
   *
   * @example
   * PermitFixtures.getValidPermit('createThisPermit').then(permit => {
   *   // permit.id = "550e8400-e29b-41d4-a716-446655440000" (generated)
   *   // permit.permitName = "Integration Test Permit"
   *   // permit.status = PermitStatus.PENDING
   * });
   */

  static getValidPermit(
    permitName: keyof ValidPermits
  ): Cypress.Chainable<Permit> {
    return this.loadValidPermits().then((permits) => {
      const permitData = permits[permitName];
      return {
        id: uuidv4(), // Generate unique ID for realistic simulation
        permitName: permitData.permitName,
        applicantName: permitData.applicantName,
        permitType: permitData.permitType,
        status: permitData.status as PermitStatus, // Type-safe enum conversion
      } as Permit;
    });
  }

  /**
   * Gets multiple permits for batch operations and pagination testing
   *
   * USAGE: Testing scenarios that require multiple permits:
   * - Pagination boundary conditions
   * - Bulk operations (delete multiple, update multiple)
   * - Table sorting and filtering
   * - Performance testing with larger datasets
   *
   * @param permitNames - Array of permit scenario names.
   * @returns Promise resolving to array of complete Permit objects
   *
   * @example
   * PermitFixtures.getMultiplePermits(['createThisPermit', 'deleteTestPermit'])
   *   .then(permits => {
   *     // permits[0] and permits[1] both have unique IDs
   *     // Useful for testing pagination, sorting, filtering
   *   });
   */
  static getMultiplePermits(
    permitNames: (keyof ValidPermits)[]
  ): Cypress.Chainable<Permit[]> {
    return this.loadValidPermits().then((permits) => {
      return permitNames.map((name) => {
        const permitData = permits[name];
        return {
          id: uuidv4(), // Each permit gets unique ID
          permitName: permitData.permitName,
          applicantName: permitData.applicantName,
          permitType: permitData.permitType,
          status: permitData.status as PermitStatus,
        } as Permit;
      });
    });
  }

  // ============================================================================
  // FORM DATA GENERATION - Objects without IDs for UI testing
  // ============================================================================

  /**
   * Gets permit data without ID for form filling operations
   *
   * PURPOSE: UI testing scenarios where ID is not needed:
   * - Form validation testing
   * - Create permit workflows (ID generated by backend)
   * - Form field population and clearing
   * - Input validation and error handling
   *
   * @param permitName - Name of the permit scenario from valid-permits.json
   * @returns Promise resolving to permit data without ID field
   *
   * @example
   * PermitFixtures.getPermitFormData('createThisPermit').then(data => {
   *   // data = { permitName: "...", applicantName: "...", permitType: "...", status: "..." }
   *   // No ID field - perfect for form filling
   *   UiActions.fillPermitForm(data.permitName, data.applicantName, ...);
   * });
   */
  static getPermitFormData(
    permitName: keyof ValidPermits
  ): Cypress.Chainable<PermitFormData> {
    return this.loadValidPermits().then((permits) => permits[permitName]);
  }

  /**
   * Gets invalid permit data for validation testing
   *
   * PURPOSE: UI testing scenarios for form validation:
   * - Testing field validation rules
   * - Error message verification
   * - Form error state handling
   * - User input correction workflows
   *
   * @param permitName - Name of the invalid permit scenario from invalid-permits.json
   * @returns Promise resolving to invalid permit data
   *
   * @example
   * PermitFixtures.getInvalidPermitFormData('permitNameTooLong').then(data => {
   *   // data = { permitName: "Very long name...", applicantName: "Valid", ... }
   *   // Used to trigger specific validation errors
   * });
   */
  static getInvalidPermitFormData(
    permitName: keyof InvalidPermits
  ): Cypress.Chainable<PermitFormData> {
    return this.loadInvalidPermits().then((permits) => permits[permitName]);
  }
}

// ============================================================================
// TYPE DEFINITIONS - Type safety for test data
// ============================================================================

/**
 * Enum for API response fixture keys used in Cypress integration tests.
 *
 * These keys correspond to predefined test permit data objects in the test fixtures,
 * eliminating hardcoded strings throughout the test suite and providing type safety
 * when referencing specific test scenarios (create, update, delete, error handling, etc.).
 *
 */

export const enum PermitFixtureKeys {
  CREATE_THIS_PERMIT = 'createThisPermit',
  DELETE_TEST_PERMIT = 'deleteTestPermit',
  UPDATE_TEST_PERMIT_BEFORE = 'updateTestPermitBefore',
  UPDATE_TEST_PERMIT_AFTER = 'updateTestPermitAfter',
  ERROR_SCENARIO_PERMIT = 'errorScenarioPermit',
  TIMEOUT_TEST_PERMIT = 'timeoutTestPermit',
}

/**
 * Enum for invalid permit fixture keys used in validation testing.
 *
 * These keys correspond to predefined invalid test permit data objects in the test fixtures,
 * specifically designed to test form validation rules and error handling scenarios.
 * Eliminates hardcoded strings throughout validation tests and provides type safety
 * when referencing specific validation test cases.
 *
 * Usage: InvalidPermitFixtureKeys.PERMIT_NAME_TOO_LONG instead of 'permitNameTooLong'
 */
export enum InvalidPermitFixtureKeys {
  // Permit Name validation scenarios
  PERMIT_NAME_TOO_LONG = 'permitNameTooLong',
  PERMIT_NAME_INVALID_CHARS = 'permitNameInvalidChars',
  PERMIT_NAME_EMPTY = 'permitNameEmpty',

  // Applicant Name validation scenarios
  APPLICANT_NAME_TOO_LONG = 'applicantNameTooLong',
  APPLICANT_NAME_INVALID_CHARS = 'applicantNameInvalidChars',
  APPLICANT_NAME_EMPTY = 'applicantNameEmpty',

  // Permit Type validation scenarios
  PERMIT_TYPE_INVALID_CHARS = 'permitTypeInvalidChars',
  PERMIT_TYPE_EMPTY = 'permitTypeEmpty',

  // Status validation scenarios
  STATUS_EMPTY = 'statusEmpty',

  // Multi-field validation scenarios
  ALL_FIELDS_INVALID = 'allFieldsInvalid',
  MIXED_VALIDATION_ERRORS = 'mixedValidationErrors',
}

/**
 * Type definitions for valid permit fixtures
 *
 * MAINTENANCE NOTE: Keep this in sync with permits/valid-permits.json
 * When adding new test scenarios, add the key name here for type safety
 *
 * CURRENT TEST SCENARIOS:
 * - createThisPermit: Standard permit creation workflow
 * - deleteTestPermit: Permit specifically for deletion testing
 * - updateTestPermitBefore/After: Update workflow testing
 * - errorScenarioPermit: Error handling and timeout testing
 * - timeoutTestPermit: Network timeout and loading state testing
 */
export interface ValidPermits {
  createThisPermit: PermitFormData;
  deleteTestPermit: PermitFormData;
  updateTestPermitBefore: PermitFormData;
  updateTestPermitAfter: PermitFormData;
  errorScenarioPermit: PermitFormData;
  timeoutTestPermit: PermitFormData;
}

/**
 * Type definition for permit form data (without ID)
 *
 * PURPOSE: Represents data structure for UI form operations
 * - Maps directly to Angular form controls
 * - Excludes ID field since forms don't handle IDs during creation
 * - Status as string to match HTML select options before enum conversion
 */
export interface PermitFormData {
  permitName: string;
  applicantName: string;
  permitType: string;
  status: string; // String to match form input, converted to enum as needed
}

/**
 * Type definition for invalid permit fixtures
 *
 * IMPLEMENTATION: Includes validation test scenarios:
 * - Missing required fields (partial objects)
 * - Invalid character sets (special chars, SQL injection attempts)
 * - Length violations (too long/short field values)
 * - Invalid enum values (non-existent status codes)
 *
 * GOVERNMENT TESTING REQUIREMENTS:
 * Invalid data testing is critical for security compliance and user experience
 */
export interface InvalidPermits {
  permitNameTooLong: PermitFormData;
  permitNameInvalidChars: PermitFormData;
  permitNameEmpty: PermitFormData;
  applicantNameTooLong: PermitFormData;
  applicantNameInvalidChars: PermitFormData;
  applicantNameEmpty: PermitFormData;
  permitTypeInvalidChars: PermitFormData;
  permitTypeEmpty: PermitFormData;
  statusEmpty: PermitFormData;
  allFieldsInvalid: PermitFormData;
  mixedValidationErrors: PermitFormData;
}

/**
 * USAGE EXAMPLES AND PATTERNS:
 *
 * // 1. Simple form filling with valid data
 * PermitFixtures.getPermitFormData('createThisPermit').then(data => {
 *   UiActions.fillPermitForm(data.permitName, data.applicantName, data.permitType, data.status);
 * });
 *
 * // 2. Validation testing with invalid data
 * PermitFixtures.getInvalidPermitFormData('permitNameTooLong').then(data => {
 *   UiActions.fillPermitForm(data.permitName, data.applicantName, data.permitType, data.status);
 *   UiActions.clickSubmitButton();
 *   UiAssertions.verifyFormError('permitName', PERMIT_FORM_ERRORS.invalidPermitName);
 * });
 *
 * // 3. API object creation
 * PermitFixtures.getValidPermit('createThisPermit').then(permit => {
 *   ApiActions.createPermit(permit);
 * });
 *
 * // 4. Batch testing
 * const testPermits = ['createThisPermit', 'deleteTestPermit'];
 * PermitFixtures.getMultiplePermits(testPermits).then(permits => {
 *   permits.forEach(permit => ApiActions.createPermit(permit));
 * });
 *
 * // 5. Update workflow testing
 * PermitFixtures.getPermitFormData('updateTestPermitBefore').then(beforeData => {
 *   // Fill form with "before" data
 *   PermitFixtures.getPermitFormData('updateTestPermitAfter').then(afterData => {
 *     // Update form with "after" data and verify changes
 *   });
 * });
 *
 * TESTING BEST PRACTICES:
 * - Use getPermitFormData() for UI interactions
 * - Use getValidPermit() for API operations
 * - Use getMultiplePermits() for batch operations
 * - Use getInvalidPermitFormData() for validation testing
 * - Always handle promises properly with .then() or async/await
 * - Keep test scenarios descriptive and purpose-specific
 */
