// ============================================================================
// api-response-fixtures.ts - API Response Mocking and Network Simulation
// ============================================================================

import {
  ApiErrorType,
  HttpMethod,
  LoadingResponseKey,
  SuccessResponseKey,
} from './api-enums';

/**
 * API Response Fixture Helper for Network Behavior Simulation
 *
 * PURPOSE:
 * - Provides centralized API response mocking for Cypress tests
 * - Simulates various network conditions (success, error, timeout, slow responses)
 *
 * CURRENT CONTEXT:
 * - Backend: Currently Faker (json-server) during Spring Boot transition
 * - API URLs: Point to dev_env.apiUrl (Faker endpoint)
 * - Future: Will support both Faker and Spring Boot API endpoints
 *
 * FIXTURE STRUCTURE:
 * api-responses/
 * ├── success-responses.json    - Happy path API responses
 * ├── error-responses.json      - Error conditions and edge cases
 * ├── loading-responses.json    - Delayed responses for loading state testing
 * └── api-response-fixtures.ts  - This helper class
 */

/**
 * API Response Management Class
 *
 * USAGE PATTERNS:
 * 1. Success Testing: Mock successful API operations for happy path testing
 * 2. Error Testing: Simulate network errors, server errors, validation errors
 * 3. Loading Testing: Add delays to test loading states and user experience
 * 4. Intercept Management: Convenient wrapper around Cypress intercept functionality
 *
 * NETWORK SIMULATION APPROACH:
 * - Success responses: Immediate return with realistic data
 * - Error responses: Proper HTTP status codes with government-standard error messages
 * - Loading responses: Configurable delays to test loading states and timeouts
 */
export class ApiResponseFixtures {
  // ============================================================================
  // FIXTURE LOADING METHODS - Raw response data access
  // ============================================================================

  /**
   * Loads all success API response mocks from JSON fixture
   *
   * USAGE: For accessing multiple success scenarios in comprehensive tests
   *
   * @returns Promise resolving to typed success response collection
   * @example
   * ApiResponseFixtures.loadSuccessResponses().then(responses => {
   *   // Access responses.createPermit, responses.getPermitsList, etc.
   * });
   */
  static loadSuccessResponses() {
    return cy.fixture(
      'api-responses/success-responses.json'
    ) as Cypress.Chainable<SuccessResponses>;
  }

  /**
   * Loads all error API response mocks from JSON fixture
   *
   * ERROR STANDARDS:
   * - Proper HTTP status codes (400, 401, 403, 404, 500, etc.)
   * - Generic error messages (no sensitive information exposure)
   * - Consistent error structure across all endpoints
   * - Validation error details for form improvement
   *
   * @returns Promise resolving to typed error response collection
   */
  static loadErrorResponses() {
    return cy.fixture(
      'api-responses/error-responses.json'
    ) as Cypress.Chainable<ErrorResponses>;
  }

  /**
   * Loads all loading/delay API response mocks from JSON fixture
   *
   * LOADING STATE TESTING:
   * - Tests user experience during slow network conditions
   * - Validates loading indicators and accessibility
   * - Simulates government network constraints
   * - Tests timeout handling and user feedback
   *
   * @returns Promise resolving to typed loading response collection
   */
  static loadLoadingResponses() {
    return cy.fixture(
      'api-responses/loading-responses.json'
    ) as Cypress.Chainable<LoadingResponses>;
  }

  // ============================================================================
  // INDIVIDUAL RESPONSE ACCESS - Specific scenario retrieval
  // ============================================================================

  /**
   * Gets a specific success response by name
   *
   * @param responseName - Name of the success response from fixtures
   * @returns Promise resolving to complete API response mock
   *
   * @example
   * ApiResponseFixtures.getSuccessResponse(SuccessResponseKey.CREATE_PERMIT).then(response => {
   *   // response = { statusCode: 201, body: { id: "...", permitName: "..." } }
   * });
   */
  static getSuccessResponse(responseName: SuccessResponseKey) {
    return this.loadSuccessResponses().then(
      (responses) => responses[responseName]
    );
  }

  /**
   * Gets a specific error response by name
   *
   * @param responseName - Name of the error response from fixtures
   * @returns Promise resolving to complete API error response mock
   *
   * @example
   * ApiResponseFixtures.getErrorResponse(ApiErrorType.SERVER_ERROR).then(response => {
   *   // response = { statusCode: 500, body: { error: "Internal Server Error", message: "..." } }
   * });
   */
  static getErrorResponse(responseName: ApiErrorType) {
    return this.loadErrorResponses().then(
      (responses) => responses[responseName]
    );
  }

  /**
   * Gets a specific loading response by name
   *
   * @param responseName - Name of the loading response from fixtures
   * @returns Promise resolving to complete API response mock with delay
   *
   * @example
   * ApiResponseFixtures.getLoadingResponse(LoadingResponseKey.SLOW_CREATE_PERMIT).then(response => {
   *   // response = { delay: 2000, statusCode: 201, body: { ... } }
   * });
   */
  static getLoadingResponse(responseName: LoadingResponseKey) {
    return this.loadLoadingResponses().then(
      (responses) => responses[responseName]
    );
  }

  // ============================================================================
  // CYPRESS INTERCEPT HELPERS - Convenient wrapper methods
  // ============================================================================

  /**
   * Helper method to set up Cypress intercept with success response
   *
   * CONVENIENCE WRAPPER: Combines fixture loading with Cypress intercept setup
   * Eliminates boilerplate code in test files for common success scenarios
   *
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param url - URL pattern to intercept (supports wildcards)
   * @param responseName - Name of success response to use
   * @param alias - Optional alias for the intercept (for cy.wait('@alias'))
   *
   * @example
   * ApiResponseFixtures.interceptWithSuccess(HttpMethod.POST, '*[*]/permits', SuccessResponseKey.CREATE_PERMIT, 'createRequest');
   * Later in test: cy.wait('@createRequest');
   */
  static interceptWithSuccess(
    method: HttpMethod,
    url: string,
    responseName: SuccessResponseKey,
    alias?: string
  ) {
    return this.getSuccessResponse(responseName).then((response) => {
      const intercept = cy.intercept(method, url, response);
      return alias ? intercept.as(alias) : intercept;
    });
  }

  /**
   * Helper method to set up Cypress intercept with error response
   *
   * ERROR TESTING CRITICAL FOR GOVERNMENT APPS:
   * - Tests application resilience under failure conditions
   * - Validates proper error messaging to users
   * - Ensures no sensitive data exposure in error responses
   * - Tests fallback behaviors and recovery mechanisms
   *
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param url - URL pattern to intercept (supports wildcards)
   * @param responseName - Name of error response to use
   * @param alias - Optional alias for the intercept
   *
   * @example
   * ApiResponseFixtures.interceptWithError(HttpMethod.POST, '*[*]/permits', ApiErrorType.SERVER_ERROR, 'errorRequest');
   * // Test error handling: cy.wait('@errorRequest'); cy.get('[role="alert"]').should('be.visible');
   */
  static interceptWithError(
    method: HttpMethod,
    url: string,
    responseName: ApiErrorType,
    alias?: string
  ) {
    return this.getErrorResponse(responseName).then((response) => {
      const intercept = cy.intercept(method, url, response);
      return alias ? intercept.as(alias) : intercept;
    });
  }

  /**
   * Helper method to set up Cypress intercept with loading response
   *
   * LOADING STATE TESTING:
   * Critical for applications where users need feedback during operations
   * Tests loading indicators, accessibility, and user experience
   *
   * IMPLEMENTATION NOTE:
   * This method properly extracts delay from response object and configures
   * Cypress intercept with separate delay parameter for correct timing simulation
   *
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param url - URL pattern to intercept
   * @param responseName - Name of loading response to use
   * @param alias - Optional alias for the intercept
   *
   * @example
   * ApiResponseFixtures.interceptWithLoading(HttpMethod.GET, '*[*]/permits', LoadingResponseKey.SLOW_GET_PERMITS, 'slowRequest');
   * // Test loading state: cy.get('[data-testid="loading-spinner"]').should('be.visible');
   * // cy.wait('@slowRequest'); cy.get('[data-testid="loading-spinner"]').should('not.exist');
   */
  static interceptWithLoading(
    method: HttpMethod,
    url: string,
    responseName: LoadingResponseKey,
    alias?: string
  ) {
    return this.getLoadingResponse(responseName).then((response) => {
      // Extract delay and create proper intercept structure
      const { delay, statusCode, body } = response;

      // Create intercept with delay as separate parameter for proper timing
      const interceptConfig = {
        delay: delay, // Separate delay parameter for Cypress timing
        statusCode: statusCode,
        body: body,
      };

      const intercept = cy.intercept(method, url, interceptConfig);
      return alias ? intercept.as(alias) : intercept;
    });
  }
}

// ============================================================================
// TYPE DEFINITIONS - Type safety for API response structures
// ============================================================================

/**
 * Type definitions for successful API response fixtures
 *
 * MAINTENANCE NOTE: Keep this in sync with api-responses/success-responses.json
 * When adding new success scenarios, add the key name here for type safety
 *
 * CURRENT SUCCESS SCENARIOS:
 * - createPermit: 201 Created with permit object
 * - updatePermit: 200 OK with updated permit object
 * - deletePermit: 200 OK with deletion confirmation
 * - getPermitsList: 200 OK with array of permits
 * - getSinglePermit: 200 OK with single permit object
 * - emptyPermitsList: 200 OK with empty array (empty state testing)
 */
export interface SuccessResponses {
  [SuccessResponseKey.CREATE_PERMIT]: ApiResponse;
  [SuccessResponseKey.UPDATE_PERMIT]: ApiResponse;
  [SuccessResponseKey.DELETE_PERMIT]: ApiResponse;
  [SuccessResponseKey.GET_PERMITS_LIST]: ApiResponse;
  [SuccessResponseKey.GET_SINGLE_PERMIT]: ApiResponse;
  [SuccessResponseKey.EMPTY_PERMITS_LIST]: ApiResponse;
}

/**
 * Type definitions for error API response fixtures
 *
 * ERROR RESPONSE STANDARDS:
 * All error responses follow consistent structure with:
 * - Proper HTTP status codes
 * - Generic error messages (no sensitive data)
 * - Validation details where appropriate
 * - Consistent JSON structure for client parsing
 *
 * CURRENT ERROR SCENARIOS:
 * - serverError: 500 Internal Server Error
 * - networkError: Network connection failure (special handling)
 * - notFound: 404 Resource not found
 * - badRequest: 400 Invalid request data
 * - serviceUnavailable: 503 Service temporarily unavailable
 */
export interface ErrorResponses {
  [ApiErrorType.SERVER_ERROR]: ApiResponse;
  [ApiErrorType.NETWORK_ERROR]: NetworkErrorResponse;
  [ApiErrorType.NOT_FOUND]: ApiResponse;
  [ApiErrorType.BAD_REQUEST]: ApiResponse;
  [ApiErrorType.BAD_GATEWAY]: ApiResponse;
  [ApiErrorType.SERVICE_UNAVAILABLE]: ApiResponse;
}

/**
 * Type definitions for loading/delayed response fixtures
 *
 * LOADING STATE TESTING SCENARIOS:
 * - slowCreatePermit: 2s delay for create operation testing
 * - slowUpdatePermit: 2s delay for update operation testing
 * - slowDeletePermit: 2s delay for delete operation testing
 * - slowGetPermits: 2s delay for list loading testing
 * - slowGetPermitsEmpty: 1.5s delay for empty list testing
 * - timeoutCreate: 30s delay for timeout testing
 * - timeoutUpdate: 30s delay for update timeout testing
 * - timeoutGetPermitsEmpty: 5s delay for empty list timeout testing
 * - extremelySlowResponse: 60s delay for extreme condition testing
 * - extremelySlowEmptyResponse: 60s delay for extreme empty state testing
 *
 * NETWORK CONSIDERATIONS:
 * Networks often have varying performance characteristics.
 * These scenarios test application behavior under different network conditions.
 */
export interface LoadingResponses {
  [LoadingResponseKey.SLOW_CREATE_PERMIT]: ApiResponseWithDelay;
  [LoadingResponseKey.SLOW_UPDATE_PERMIT]: ApiResponseWithDelay;
  [LoadingResponseKey.SLOW_DELETE_PERMIT]: ApiResponseWithDelay;
  [LoadingResponseKey.SLOW_GET_PERMITS]: ApiResponseWithDelay;
  [LoadingResponseKey.SLOW_GET_PERMITS_EMPTY]: ApiResponseWithDelay;
  [LoadingResponseKey.TIMEOUT_CREATE]: ApiResponseWithDelay;
  [LoadingResponseKey.TIMEOUT_UPDATE]: ApiResponseWithDelay;
  [LoadingResponseKey.TIMEOUT_GET_PERMITS_EMPTY]: ApiResponseWithDelay;
  [LoadingResponseKey.EXTREMELY_SLOW_RESPONSE]: ApiResponseWithDelay;
  [LoadingResponseKey.EXTREMELY_SLOW_EMPTY_RESPONSE]: ApiResponseWithDelay;
}

/**
 * Base API response structure
 *
 * STANDARD STRUCTURE:
 * - statusCode: HTTP status code (200, 201, 400, 500, etc.)
 * - body: Response payload (permit object, error details, etc.)
 */
export interface ApiResponse {
  statusCode: number;
  body: any;
}

/**
 * API response with delay for loading state testing
 *
 * EXTENDS BASE RESPONSE:
 * Adds delay field for simulating network latency and loading states
 * Used by interceptWithLoading() method for proper timing simulation
 */
export interface ApiResponseWithDelay extends ApiResponse {
  delay: number; // Milliseconds to delay response
}

/**
 * Network error response structure (different from API response)
 *
 * SPECIAL CASE:
 * Network errors don't have status codes or bodies - they represent
 * complete network failure (connection refused, DNS failure, etc.)
 * Cypress handles these differently than HTTP error responses
 */
export interface NetworkErrorResponse {
  forceNetworkError: boolean;
}

/**
 * Union type for all possible error responses
 *
 * HANDLES BOTH:
 * - HTTP error responses (with status codes and error bodies)
 * - Network error responses (complete connection failure)
 */
export type ErrorResponse = ApiResponse | NetworkErrorResponse;

/**
 * USAGE EXAMPLES AND PATTERNS:
 *
 * // 1. Simple success intercept
 * ApiResponseFixtures.interceptWithSuccess(HttpMethod.GET, '*[*]/permits', SuccessResponseKey.GET_PERMITS_LIST);
 *
 * // 2. Error testing with alias
 * ApiResponseFixtures.interceptWithError(HttpMethod.POST, '*[*]/permits', ApiErrorType.SERVER_ERROR, 'errorRequest');
 * cy.wait('@errorRequest');
 * cy.get('[role="alert"]').should('contain', 'Internal Server Error');
 *
 * // 3. Service unavailable testing
 * ApiResponseFixtures.interceptWithError(HttpMethod.GET, '*[*]/permits', ApiErrorType.SERVICE_UNAVAILABLE, 'maintenanceRequest');
 * cy.wait('@maintenanceRequest');
 * cy.get('[role="alert"]').should('contain', 'Service temporarily unavailable');
 *
 * // 4. Loading state testing
 * ApiResponseFixtures.interceptWithLoading(HttpMethod.GET, '*[*]/permits', LoadingResponseKey.SLOW_GET_PERMITS, 'slowRequest');
 * cy.get('[data-testid="loading-spinner"]').should('be.visible');
 * cy.wait('@slowRequest');
 * cy.get('[data-testid="loading-spinner"]').should('not.exist');
 *
 * TESTING BEST PRACTICES:
 * - Always test both success and error scenarios
 * - Test loading states for accessibility compliance
 * - Use realistic delays that match different network conditions
 * - Test timeout scenarios for mission-critical operations
 * - Validate error messages don't expose sensitive information
 * - Test network failure recovery mechanisms
 * - Test maintenance window scenarios with 503 errors
 *
 * MAINTENANCE NOTES:
 * - Keep fixture JSON files in sync with these TypeScript interfaces
 * - Add new scenarios to both JSON files and interface definitions
 * - Test intercept aliases are unique across test files
 * - Loading delays should be reasonable for CI/CD pipeline execution
 * - Error messages should follow government communication standards
 */
