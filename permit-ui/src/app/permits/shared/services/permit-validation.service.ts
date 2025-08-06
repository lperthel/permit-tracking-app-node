import { Injectable } from '@angular/core';
import { Permit } from '../models/permit.model';

/**
 * Service responsible for validating permit data integrity and compliance
 * Handles data validation for government permit tracking system
 * Provides audit logging for compliance requirements
 */
@Injectable({ providedIn: 'root' })
export class PermitValidationService {
  // Constants defined at top per project guidelines
  private static readonly VALIDATION_ERROR_MESSAGE =
    'Invalid permit data received from server';
  private static readonly INPUT_VALIDATION_ERROR =
    'Invalid permit data provided';
  private static readonly REQUIRED_PERMIT_FIELDS = [
    'id',
    'permitName',
    'applicantName',
    'permitType',
    'status',
  ] as const;
  private static readonly INVALID_DATA_LOG_PREFIX =
    'Invalid permit data filtered out';
  private static readonly DATA_QUALITY_LOG_PREFIX = 'Data validation';

  /**
   * Validates that an object contains all required Permit fields with valid values
   * @param data - Object to validate against Permit interface
   * @returns Type guard indicating if data is a valid Permit
   */
  isValidPermit(data: any): data is Permit {
    if (!data || typeof data !== 'object') {
      return false;
    }

    return PermitValidationService.REQUIRED_PERMIT_FIELDS.every(
      (field) =>
        field in data &&
        typeof data[field] === 'string' &&
        data[field].trim().length > 0
    );
  }

  /**
   * Validates input permit data before API operations
   * Throws error for invalid data to prevent bad requests
   * @param permit - Permit object to validate
   * @throws Error if permit data is invalid
   */
  validateInputPermit(permit: any): asserts permit is Permit {
    if (!this.isValidPermit(permit)) {
      throw new Error(PermitValidationService.INPUT_VALIDATION_ERROR);
    }
  }

  /**
   * Validates and filters array of permit data from server responses
   * Removes invalid entries and logs audit trail for compliance
   * @param data - Server response data to validate
   * @returns Array of validated Permit objects
   * @throws Error if response structure is fundamentally invalid
   */
  validateAndFilterPermits(data: any): Permit[] {
    // Validate response structure
    if (!Array.isArray(data)) {
      console.error(
        PermitValidationService.INVALID_DATA_LOG_PREFIX,
        'Response is not an array'
      );
      throw new Error(PermitValidationService.VALIDATION_ERROR_MESSAGE);
    }

    const validPermits: Permit[] = [];
    const originalCount = data.length;

    // Process each item and filter invalid entries
    data.forEach((item, index) => {
      if (this.isValidPermit(item)) {
        validPermits.push(item);
      } else {
        // Audit log: record validation failure without exposing sensitive data
        console.warn(
          PermitValidationService.INVALID_DATA_LOG_PREFIX,
          `Item at index ${index}`
        );
      }
    });

    // Government compliance: log data quality metrics
    const filteredCount = originalCount - validPermits.length;
    if (filteredCount > 0) {
      console.warn(
        `${PermitValidationService.DATA_QUALITY_LOG_PREFIX}: ${filteredCount} invalid permits filtered out of ${originalCount}`
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
  validateSinglePermitResponse(data: any): Permit {
    if (!this.isValidPermit(data)) {
      console.error(
        PermitValidationService.INVALID_DATA_LOG_PREFIX,
        'Single permit response invalid'
      );
      throw new Error(PermitValidationService.VALIDATION_ERROR_MESSAGE);
    }
    return data;
  }

  /**
   * Validates permit status against allowed values
   * @param status - Status string to validate
   * @returns true if status is valid
   */
  isValidStatus(status: string): boolean {
    const VALID_STATUSES = [
      'SUBMITTED',
      'APPROVED',
      'REJECTED',
      'UNDER_REVIEW',
    ];
    return VALID_STATUSES.includes(status);
  }

  /**
   * Gets validation error message for client display
   * Generic message to avoid exposing internal validation logic
   * @returns User-friendly error message
   */
  getValidationErrorMessage(): string {
    return 'The permit data is incomplete or invalid. Please check all required fields.';
  }
}
