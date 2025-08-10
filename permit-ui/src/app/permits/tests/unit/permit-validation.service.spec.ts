/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import {
  createThisPermit,
  updatePermit,
} from '../../../assets/constants/test-permits';
import { Permit } from '../../shared/models/permit.model';
import { PermitValidationService } from '../../shared/services/permit-validation.service';

describe('PermitValidationService', () => {
  let service: PermitValidationService;

  // Test constants - now using service constants
  const VALID_PERMIT: Permit = createThisPermit;
  const VALIDATION_ERROR_MESSAGE =
    PermitValidationService.VALIDATION_ERROR_MESSAGE;
  const INPUT_VALIDATION_ERROR = PermitValidationService.INPUT_VALIDATION_ERROR; // This should match the private constant
  const INVALID_DATA_LOG_PREFIX =
    PermitValidationService.INVALID_DATA_LOG_PREFIX;
  const ITEM_INDEX_LOG_PREFIX = PermitValidationService.ITEM_INDEX_LOG_PREFIX;
  const DATA_QUALITY_LOG_PREFIX =
    PermitValidationService.DATA_QUALITY_LOG_PREFIX;
  const RESPONSE_NOT_ARRAY_ERROR =
    PermitValidationService.RESPONSE_NOT_ARRAY_ERROR;
  const USER_FRIENDLY_ERROR = PermitValidationService.USER_FRIENDLY_ERROR;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermitValidationService],
    });
    service = TestBed.inject(PermitValidationService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('isValidPermit', () => {
    it('should return true for valid permit', () => {
      const result = service.isValidPermit(VALID_PERMIT);
      expect(result).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(service.isValidPermit(null)).toBe(false);
      expect(service.isValidPermit(undefined)).toBe(false);
    });

    it('should return false for non-object data', () => {
      expect(service.isValidPermit('string')).toBe(false);
      expect(service.isValidPermit(123)).toBe(false);
      expect(service.isValidPermit(true)).toBe(false);
      expect(service.isValidPermit([])).toBe(false);
    });

    it('should return false for missing required fields', () => {
      const missingId = { ...VALID_PERMIT };
      delete (missingId as any).id;
      expect(service.isValidPermit(missingId)).toBe(false);

      const missingPermitName = { ...VALID_PERMIT };
      delete (missingPermitName as any).permitName;
      expect(service.isValidPermit(missingPermitName)).toBe(false);

      const missingApplicantName = { ...VALID_PERMIT };
      delete (missingApplicantName as any).applicantName;
      expect(service.isValidPermit(missingApplicantName)).toBe(false);

      const missingPermitType = { ...VALID_PERMIT };
      delete (missingPermitType as any).permitType;
      expect(service.isValidPermit(missingPermitType)).toBe(false);

      const missingStatus = { ...VALID_PERMIT };
      delete (missingStatus as any).status;
      expect(service.isValidPermit(missingStatus)).toBe(false);
    });

    it('should return false for empty string fields', () => {
      const emptyId = { ...VALID_PERMIT, id: '' };
      expect(service.isValidPermit(emptyId)).toBe(false);

      const emptyPermitName = { ...VALID_PERMIT, permitName: '' };
      expect(service.isValidPermit(emptyPermitName)).toBe(false);
    });

    it('should return false for whitespace-only fields', () => {
      const whitespaceId = { ...VALID_PERMIT, id: '   ' };
      expect(service.isValidPermit(whitespaceId)).toBe(false);

      const whitespacePermitName = { ...VALID_PERMIT, permitName: '\t\n ' };
      expect(service.isValidPermit(whitespacePermitName)).toBe(false);
    });

    it('should return false for non-string field values', () => {
      const numericId = { ...VALID_PERMIT, id: 123 };
      expect(service.isValidPermit(numericId)).toBe(false);

      const booleanStatus = { ...VALID_PERMIT, status: true };
      expect(service.isValidPermit(booleanStatus)).toBe(false);

      const objectField = { ...VALID_PERMIT, permitName: { name: 'test' } };
      expect(service.isValidPermit(objectField)).toBe(false);
    });
  });

  describe('validateInputPermit', () => {
    it('should not throw for valid permit', () => {
      expect(() => service.validateInputPermit(VALID_PERMIT)).not.toThrow();
    });

    it('should throw specific error for invalid permit', () => {
      const invalidPermit = { invalid: 'data' };

      expect(() => service.validateInputPermit(invalidPermit)).toThrowError(
        INPUT_VALIDATION_ERROR
      );
    });

    it('should throw for missing required fields', () => {
      const incompletePermit = {
        id: 'test-id',
        permitName: 'Test Permit',
        // Missing other required fields
      };

      expect(() => service.validateInputPermit(incompletePermit)).toThrowError(
        INPUT_VALIDATION_ERROR
      );
    });
  });

  describe('validateAndFilterPermits', () => {
    beforeEach(() => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
    });

    it('should return valid permits unchanged', () => {
      const validData = [VALID_PERMIT, updatePermit];

      const result = service.validateAndFilterPermits(validData);

      expect(result).toEqual(validData);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should filter out invalid permits and log warnings', () => {
      const mixedData = [
        VALID_PERMIT, // ✅ Valid
        { invalid: 'data' }, // ❌ Invalid
        updatePermit, // ✅ Valid
        { id: '', permitName: 'test' }, // ❌ Invalid - empty ID
      ];

      const result = service.validateAndFilterPermits(mixedData);

      expect(result.length).toBe(2);
      expect(result).toEqual([VALID_PERMIT, updatePermit]);

      // Verify audit logging - using constants
      expect(console.warn).toHaveBeenCalledWith(
        INVALID_DATA_LOG_PREFIX,
        `${ITEM_INDEX_LOG_PREFIX} 1`
      );
      expect(console.warn).toHaveBeenCalledWith(
        INVALID_DATA_LOG_PREFIX,
        `${ITEM_INDEX_LOG_PREFIX} 3`
      );
      expect(console.warn).toHaveBeenCalledWith(
        `${DATA_QUALITY_LOG_PREFIX}: 2 invalid permits filtered out of 4`
      );
    });

    it('should handle empty array', () => {
      const result = service.validateAndFilterPermits([]);

      expect(result).toEqual([]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should throw error for non-array input', () => {
      const invalidInput = { not: 'an array' };

      expect(() => service.validateAndFilterPermits(invalidInput)).toThrowError(
        VALIDATION_ERROR_MESSAGE
      );

      expect(console.error).toHaveBeenCalledWith(
        INVALID_DATA_LOG_PREFIX,
        RESPONSE_NOT_ARRAY_ERROR
      );
    });

    it('should handle all invalid permits', () => {
      const allInvalidData = [
        { invalid: 'data1' },
        { invalid: 'data2' },
        null,
        undefined,
      ];

      const result = service.validateAndFilterPermits(allInvalidData);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        `${DATA_QUALITY_LOG_PREFIX}: 4 invalid permits filtered out of 4`
      );
    });
  });

  describe('validateSinglePermitResponse', () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    it('should return valid permit unchanged', () => {
      const result = service.validateSinglePermitResponse(VALID_PERMIT);

      expect(result).toEqual(VALID_PERMIT);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should throw error for invalid permit', () => {
      const invalidData = { invalid: 'response' };

      expect(() =>
        service.validateSinglePermitResponse(invalidData)
      ).toThrowError(VALIDATION_ERROR_MESSAGE);

      expect(console.error).toHaveBeenCalledWith(
        INVALID_DATA_LOG_PREFIX,
        'Single permit validation failed for permit: [object Object]'
      );
    });

    it('should throw error for null response', () => {
      expect(() => service.validateSinglePermitResponse(null)).toThrowError(
        VALIDATION_ERROR_MESSAGE
      );
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid statuses', () => {
      expect(service.isValidStatus('SUBMITTED')).toBe(true);
      expect(service.isValidStatus('APPROVED')).toBe(true);
      expect(service.isValidStatus('REJECTED')).toBe(true);
      expect(service.isValidStatus('UNDER_REVIEW')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(service.isValidStatus('INVALID_STATUS')).toBe(false);
      expect(service.isValidStatus('')).toBe(false);
      expect(service.isValidStatus('submitted')).toBe(false); // Case sensitive
      expect(service.isValidStatus('PENDING')).toBe(false);
    });

    it('should handle non-string input', () => {
      expect(service.isValidStatus(null as any)).toBe(false);
      expect(service.isValidStatus(undefined as any)).toBe(false);
      expect(service.isValidStatus(123 as any)).toBe(false);
    });
  });

  describe('getValidationErrorMessage', () => {
    it('should return user-friendly error message', () => {
      const message = service.getValidationErrorMessage();

      expect(message).toBe(USER_FRIENDLY_ERROR);
      expect(message).not.toContain('server'); // No internal details exposed
    });
  });
});
