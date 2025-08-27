// ============================================================================
// api-intercepts.ts - All API mocking and intercepts
// ============================================================================

import {
  ApiEndpoint,
  ApiErrorType,
  ApiLoadingType,
  ApiOperation,
  HttpMethod,
  LoadingResponseKey,
  SuccessResponseKey,
} from './api-enums';
import { ApiResponseFixtures } from './api-response-fixtures';

// ============================================================================
// ENDPOINT CONFIGURATIONS - Centralized endpoint definitions
// ============================================================================

interface EndpointConfig {
  method: HttpMethod;
  url: ApiEndpoint;
  response: SuccessResponseKey;
}

interface ErrorEndpointConfig {
  method: HttpMethod;
  url: ApiEndpoint;
}

interface LoadingEndpointConfig {
  method: HttpMethod;
  url: ApiEndpoint;
  responses: Record<ApiLoadingType, LoadingResponseKey>;
}

export class ApiIntercepts {
  // ============================================================================
  // ENDPOINT CONFIGURATION MAPS
  // ============================================================================

  private static readonly SUCCESS_ENDPOINTS: Record<
    ApiOperation,
    EndpointConfig
  > = {
    [ApiOperation.CREATE]: {
      method: HttpMethod.POST,
      url: ApiEndpoint.PERMITS,
      response: SuccessResponseKey.CREATE_PERMIT,
    },
    [ApiOperation.UPDATE]: {
      method: HttpMethod.PUT,
      url: ApiEndpoint.PERMIT_BY_ID,
      response: SuccessResponseKey.UPDATE_PERMIT,
    },
    [ApiOperation.DELETE]: {
      method: HttpMethod.DELETE,
      url: ApiEndpoint.PERMIT_BY_ID,
      response: SuccessResponseKey.DELETE_PERMIT,
    },
    [ApiOperation.GET_LIST]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMITS,
      response: SuccessResponseKey.GET_PERMITS_LIST,
    },
    [ApiOperation.GET_SINGLE]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMIT_BY_ID,
      response: SuccessResponseKey.GET_SINGLE_PERMIT,
    },
    [ApiOperation.EMPTY]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMITS,
      response: SuccessResponseKey.EMPTY_PERMITS_LIST,
    },
    [ApiOperation.GET]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMITS,
      response: SuccessResponseKey.GET_PERMITS_LIST,
    },
  };

  private static readonly ERROR_ENDPOINTS: Record<
    Exclude<ApiOperation, 'getSingle' | 'getList' | 'empty'>,
    ErrorEndpointConfig
  > = {
    [ApiOperation.CREATE]: {
      method: HttpMethod.POST,
      url: ApiEndpoint.PERMITS,
    },
    [ApiOperation.UPDATE]: {
      method: HttpMethod.PUT,
      url: ApiEndpoint.PERMIT_BY_ID,
    },
    [ApiOperation.DELETE]: {
      method: HttpMethod.DELETE,
      url: ApiEndpoint.PERMIT_BY_ID,
    },
    [ApiOperation.GET]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMITS,
    },
  };

  private static readonly LOADING_ENDPOINTS: Record<
    Exclude<ApiOperation, 'getSingle' | 'getList' | 'empty'>,
    LoadingEndpointConfig
  > = {
    [ApiOperation.CREATE]: {
      method: HttpMethod.POST,
      url: ApiEndpoint.PERMITS,
      responses: {
        [ApiLoadingType.SLOW]: LoadingResponseKey.SLOW_CREATE_PERMIT,
        [ApiLoadingType.TIMEOUT]: LoadingResponseKey.TIMEOUT_CREATE,
        [ApiLoadingType.EXTREMELY_SLOW]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
        [ApiLoadingType.SLOW_EMPTY]: LoadingResponseKey.SLOW_CREATE_PERMIT, // Create doesn't return empty, use regular slow
        [ApiLoadingType.TIMEOUT_EMPTY]: LoadingResponseKey.TIMEOUT_CREATE,
        [ApiLoadingType.EXTREMELY_SLOW_EMPTY]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
      },
    },
    [ApiOperation.UPDATE]: {
      method: HttpMethod.PUT,
      url: ApiEndpoint.PERMIT_BY_ID,
      responses: {
        [ApiLoadingType.SLOW]: LoadingResponseKey.SLOW_UPDATE_PERMIT,
        [ApiLoadingType.TIMEOUT]: LoadingResponseKey.TIMEOUT_UPDATE,
        [ApiLoadingType.EXTREMELY_SLOW]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
        [ApiLoadingType.SLOW_EMPTY]: LoadingResponseKey.SLOW_UPDATE_PERMIT, // Update doesn't return empty, use regular slow
        [ApiLoadingType.TIMEOUT_EMPTY]: LoadingResponseKey.TIMEOUT_UPDATE,
        [ApiLoadingType.EXTREMELY_SLOW_EMPTY]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
      },
    },
    [ApiOperation.DELETE]: {
      method: HttpMethod.DELETE,
      url: ApiEndpoint.PERMIT_BY_ID,
      responses: {
        [ApiLoadingType.SLOW]: LoadingResponseKey.SLOW_DELETE_PERMIT,
        [ApiLoadingType.TIMEOUT]: LoadingResponseKey.TIMEOUT_CREATE,
        [ApiLoadingType.EXTREMELY_SLOW]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
        [ApiLoadingType.SLOW_EMPTY]: LoadingResponseKey.SLOW_DELETE_PERMIT, // Delete doesn't return data, use regular slow
        [ApiLoadingType.TIMEOUT_EMPTY]: LoadingResponseKey.TIMEOUT_CREATE,
        [ApiLoadingType.EXTREMELY_SLOW_EMPTY]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
      },
    },
    [ApiOperation.GET]: {
      method: HttpMethod.GET,
      url: ApiEndpoint.PERMITS,
      responses: {
        [ApiLoadingType.SLOW]: LoadingResponseKey.SLOW_GET_PERMITS,
        [ApiLoadingType.TIMEOUT]: LoadingResponseKey.TIMEOUT_CREATE,
        [ApiLoadingType.EXTREMELY_SLOW]:
          LoadingResponseKey.EXTREMELY_SLOW_RESPONSE,
        [ApiLoadingType.SLOW_EMPTY]: LoadingResponseKey.SLOW_GET_PERMITS_EMPTY, // Empty list with delay
        [ApiLoadingType.TIMEOUT_EMPTY]:
          LoadingResponseKey.TIMEOUT_GET_PERMITS_EMPTY, // Empty list with long delay
        [ApiLoadingType.EXTREMELY_SLOW_EMPTY]:
          LoadingResponseKey.EXTREMELY_SLOW_EMPTY_RESPONSE, // Empty list with extreme delay
      },
    },
  };

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Sets up successful API response intercepts
   *
   * @param operation - The API operation to intercept
   * @param alias - Optional alias for the intercept
   * @returns Cypress chainable for the intercept
   *
   * @example
   * ApiIntercepts.interceptSuccess(ApiOperation.CREATE, 'createPermit');
   * ApiIntercepts.interceptSuccess(ApiOperation.GET_LIST);
   */
  static interceptSuccess(
    operation: ApiOperation,
    alias?: string
  ): Cypress.Chainable<any> {
    const config = this.SUCCESS_ENDPOINTS[operation];
    return ApiResponseFixtures.interceptWithSuccess(
      config.method,
      config.url,
      config.response,
      alias
    );
  }

  /**
   * Sets up error response intercepts
   *
   * @param operation - The API operation to intercept
   * @param errorType - The type of error to simulate
   * @param alias - Optional alias for the intercept
   * @returns Cypress chainable for the intercept
   *
   * @example
   * ApiIntercepts.interceptError(ApiOperation.CREATE, ApiErrorType.SERVER_ERROR, 'createError');
   * ApiIntercepts.interceptError(ApiOperation.DELETE, ApiErrorType.NOT_FOUND);
   */
  static interceptError(
    operation: Exclude<ApiOperation, 'getSingle' | 'getList' | 'empty'>,
    errorType: ApiErrorType,
    alias?: string
  ): Cypress.Chainable<any> {
    const config = this.ERROR_ENDPOINTS[operation];
    return ApiResponseFixtures.interceptWithError(
      config.method,
      config.url,
      errorType,
      alias
    );
  }

  /**
   * Sets up loading/slow response intercepts
   *
   * @param operation - The API operation to intercept
   * @param loadingType - The type of loading behavior to simulate
   * @param alias - Optional alias for the intercept
   * @returns Cypress chainable for the intercept
   *
   * @example
   * ApiIntercepts.interceptLoading(ApiOperation.GET, ApiLoadingType.SLOW, 'slowGet');
   * ApiIntercepts.interceptLoading(ApiOperation.CREATE, ApiLoadingType.TIMEOUT);
   */
  static interceptLoading(
    operation: Exclude<ApiOperation, 'getSingle' | 'getList' | 'empty'>,
    loadingType: ApiLoadingType,
    alias?: string
  ): Cypress.Chainable<any> {
    const config = this.LOADING_ENDPOINTS[operation];
    return ApiResponseFixtures.interceptWithLoading(
      config.method,
      config.url,
      config.responses[loadingType],
      alias
    );
  }

  /**
   * Clears an existing intercept by overriding it with a pass-through
   *
   * @param httpMethod - The HTTP method to clear (GET, POST, PUT, DELETE, PATCH)
   * @param alias - The alias of the intercept to clear
   *
   * @example
   * ApiIntercepts.clearIntercept(HttpMethod.PUT, 'updateErrorFirst');
   * ApiIntercepts.interceptSuccess(ApiOperation.UPDATE, 'updateSuccess');
   */
  static clearIntercept(httpMethod: HttpMethod, alias: string): void {
    cy.intercept(httpMethod, '**/permits/**', (req) => {
      req.continue();
    }).as(`${alias}_cleared`);
  }
}
