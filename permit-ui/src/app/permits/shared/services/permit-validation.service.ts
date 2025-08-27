import { Injectable } from '@angular/core';
import { PERMIT_STATUS_VALUES } from '../models/permit-status.enums';
import { Permit } from '../models/permit.model';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Service responsible for validating permit data integrity and compliance
 * Handles data validation for government permit tracking system
 * Provides audit logging for compliance requirements
 */
@Injectable({ providedIn: 'root' })
export class PermitValidationService {
  // Error messages
  public static readonly VALIDATION_ERROR_MESSAGE =
    'Invalid permit data received from server';
  public static readonly INPUT_VALIDATION_ERROR =
    'Invalid permit data provided';
  public static readonly USER_FRIENDLY_ERROR =
    'The permit data is incomplete or invalid. Please check all required fields.';

  // Validation criteria
  public static readonly REQUIRED_PERMIT_FIELDS = [
    'id',
    'permitName',
    'applicantName',
    'permitType',
    'status',
  ] as const;

  // Logging messages
  public static readonly INVALID_DATA_LOG_PREFIX =
    'Invalid permit data filtered out';
  public static readonly DATA_QUALITY_LOG_PREFIX = 'Data validation';
  public static readonly RESPONSE_NOT_ARRAY_ERROR = 'Response is not an array';
  public static readonly ITEM_INDEX_LOG_PREFIX = 'Item at index';
  public static readonly FILTERED_COUNT_LOG_TEMPLATE =
    'invalid permits filtered out of';
  public static readonly SINGLE_PERMIT_VALIDATION_ERROR_PREFIX =
    'Single permit validation failed for permit:';

  // Data type constants
  private static readonly OBJECT_TYPE = 'object';
  private static readonly STRING_TYPE = 'string';

  /**
   * Validates that an object contains all required Permit fields with valid values
   * @param data - Object to validate against Permit interface
   * @returns Type guard indicating if data is a valid Permit
   */
  isValidPermit(data: unknown): data is Permit {
    if (!data || typeof data !== PermitValidationService.OBJECT_TYPE) {
      return false;
    }
    //Use record as a typesafe way to check the contents of data
    //We are currently validating so record could have invalid data/fields
    const dataRecord = data as Record<string, unknown>;

    return PermitValidationService.REQUIRED_PERMIT_FIELDS.every(
      (field) =>
        field in dataRecord &&
        typeof dataRecord[field] === PermitValidationService.STRING_TYPE &&
        (dataRecord[field] as string).trim().length > 0
    );
  }

  /**
   * Validates input permit data before API operations
   * Throws error for invalid data to prevent bad requests
   * @param permit - Permit object to validate
   * @throws Error if permit data is invalid
   */
  validateInputPermit(permit: unknown): asserts permit is Permit {
    if (!this.isValidPermit(permit)) {
      throw new ValidationError(PermitValidationService.INPUT_VALIDATION_ERROR);
    }
  }

  /**
   * Validates and filters array of permit data from server responses
   * Removes invalid entries and logs audit trail for compliance
   * @param data - Server response data to validate
   * @returns Array of validated Permit objects
   * @throws Error if response structure is fundamentally invalid
   */
  validateAndFilterPermits(data: unknown): Permit[] {
    // Validate response structure
    if (!Array.isArray(data)) {
      console.error(
        PermitValidationService.INVALID_DATA_LOG_PREFIX,
        PermitValidationService.RESPONSE_NOT_ARRAY_ERROR
      );
      throw new ValidationError(
        PermitValidationService.VALIDATION_ERROR_MESSAGE
      );
    }

    const validPermits: Permit[] = [];
    const originalCount = data.length;

    // Process each item and filter invalid entries
    data.forEach((item, index) => {
      if (this.isValidPermit(item)) {
        validPermits.push(item);
      } else {
        console.warn(
          PermitValidationService.INVALID_DATA_LOG_PREFIX,
          `${PermitValidationService.ITEM_INDEX_LOG_PREFIX} ${index}`
        );
      }
    });

    const filteredCount = originalCount - validPermits.length;
    if (filteredCount > 0) {
      console.warn(
        `${PermitValidationService.DATA_QUALITY_LOG_PREFIX}: ${filteredCount} ${PermitValidationService.FILTERED_COUNT_LOG_TEMPLATE} ${originalCount}`
      );
    }

    return validPermits;
  }

  /**
   * Validates single permit response from server
   * Used for create/update operations that return single permit
   * @param data - Server response data
   * @returns Validated Permit object
   * @throws Error if response is invalid
   */
  validateSinglePermitResponse(data: unknown): Permit {
    if (!this.isValidPermit(data)) {
      console.error(
        PermitValidationService.INVALID_DATA_LOG_PREFIX,
        singlePermitValidationError(data)
      );
      throw new ValidationError(
        PermitValidationService.VALIDATION_ERROR_MESSAGE
      );
    }
    return data;
  }

  /**
   * Validates permit status against allowed values
   * @param status - Status string to validate
   * @returns true if status is valid
   */
  isValidStatus(status: string): boolean {
    return PERMIT_STATUS_VALUES.includes(status as any);
  }

  /**
   * Gets validation error message for client display
   * Generic message to avoid exposing internal validation logic
   * @returns User-friendly error message
   */
  getValidationErrorMessage(): string {
    return PermitValidationService.USER_FRIENDLY_ERROR;
  }
}

export const singlePermitValidationError = (data: unknown) => {
  return `${PermitValidationService.SINGLE_PERMIT_VALIDATION_ERROR_PREFIX} ${data}`;
};
