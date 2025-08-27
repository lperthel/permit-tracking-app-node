// ============================================================================
// api-enums.ts - Centralized API testing enums shared across all API testing utilities
// ============================================================================

/**
 * API Operations that can be intercepted
 * Maps to standard CRUD operations plus list retrieval
 */
export enum ApiOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  GET_LIST = 'getList',
  GET_SINGLE = 'getSingle',
  EMPTY = 'empty',
  GET = 'get', // For error and loading scenarios
}

/**
 * HTTP Error Types for API testing
 * Covers common error scenarios in government applications
 *
 * NOTE: This enum serves dual purposes:
 * 1. High-level API parameter (ApiErrorType usage)
 * 2. Low-level fixture keys (ErrorResponseKey usage)
 */
export enum ApiErrorType {
  SERVER_ERROR = 'serverError',
  NETWORK_ERROR = 'networkError',
  NOT_FOUND = 'notFound',
  BAD_REQUEST = 'badRequest',
  BAD_GATEWAY = 'badGateway',
  SERVICE_UNAVAILABLE = 'serviceUnavailable',
}

/**
 * Type alias for error response fixture keys
 * Uses the same enum as ApiErrorType for consistency
 */
export type ErrorResponseKey = ApiErrorType;

/**
 * API Loading/Performance Test Scenarios
 * Used to test loading states and timeout handling
 */
export enum ApiLoadingType {
  SLOW = 'slow',
  TIMEOUT = 'timeout',
  EXTREMELY_SLOW = 'extremelySlow',
  SLOW_EMPTY = 'slowEmpty',
  TIMEOUT_EMPTY = 'timeoutEmpty',
  EXTREMELY_SLOW_EMPTY = 'extremelySlowEmpty',
}

/**
 * HTTP Methods for API endpoint configuration
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * API Endpoint URL patterns
 */
export enum ApiEndpoint {
  PERMITS = '**/permits',
  PERMIT_BY_ID = '**/permits/*',
}

// ============================================================================
// RESPONSE KEY ENUMS - Separated by response type for type safety
// ============================================================================

/**
 * Success API Response Fixture Keys
 * Maps to keys in success-responses.json
 */
export enum SuccessResponseKey {
  CREATE_PERMIT = 'createPermit',
  UPDATE_PERMIT = 'updatePermit',
  DELETE_PERMIT = 'deletePermit',
  GET_PERMITS_LIST = 'getPermitsList',
  GET_SINGLE_PERMIT = 'getSinglePermit',
  EMPTY_PERMITS_LIST = 'emptyPermitsList',
}

/**
 * Loading API Response Fixture Keys
 * Maps to keys in loading-responses.json
 */
export enum LoadingResponseKey {
  SLOW_CREATE_PERMIT = 'slowCreatePermit',
  SLOW_UPDATE_PERMIT = 'slowUpdatePermit',
  SLOW_DELETE_PERMIT = 'slowDeletePermit',
  SLOW_GET_PERMITS = 'slowGetPermits',
  SLOW_GET_PERMITS_EMPTY = 'slowGetPermitsEmpty',
  TIMEOUT_CREATE = 'timeoutCreate',
  TIMEOUT_UPDATE = 'timeoutUpdate',
  TIMEOUT_GET_PERMITS_EMPTY = 'timeoutGetPermitsEmpty',
  EXTREMELY_SLOW_RESPONSE = 'extremelySlowResponse',
  EXTREMELY_SLOW_EMPTY_RESPONSE = 'extremelySlowEmptyResponse',
}

// ============================================================================
// LEGACY UNION TYPE - For backward compatibility if needed
// ============================================================================

/**
 * Combined API Response Keys (all types)
 * Use specific enums above instead for better type safety
 */
export type ApiResponseKey =
  | SuccessResponseKey
  | ApiErrorType
  | LoadingResponseKey;
