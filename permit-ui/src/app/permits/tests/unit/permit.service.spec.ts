import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { API_CONSTANTS } from '../../../assets/constants/service.constants';
import {
  createThisPermit,
  deleteThisPermit,
  updatePermit,
} from '../../../assets/constants/test-permits';
import { UI_TEXT } from '../../../assets/constants/ui-text.constants';
import { Permit } from '../../shared/models/permit.model';
import {
  PermitValidationService,
  ValidationError,
} from '../../shared/services/permit-validation.service';
import { PermitService } from '../../shared/services/permit.service';

describe('PermitService', () => {
  let service: PermitService;
  let httpMock: HttpTestingController;
  let validationServiceSpy: jasmine.SpyObj<PermitValidationService>;

  // Constants defined at top of describe block
  const BASE_URL = `${environment.apiUrl}${API_CONSTANTS.PERMITS_PATH}`;
  const MOCK_PERMITS: Permit[] = [createThisPermit, updatePermit];
  const ERROR_STATUS = 500;

  // Reference validation service constants
  const VALIDATION_ERROR = PermitValidationService.INPUT_VALIDATION_ERROR;
  const VALIDATION_ERROR_MESSAGE =
    PermitValidationService.VALIDATION_ERROR_MESSAGE;
  const SERVER_ERROR = UI_TEXT.SERVER_CONNECTION_ERROR;

  // HTTP and test constants
  const CONTENT_TYPE_HEADER = 'Content-Type';
  const APPLICATION_JSON = 'application/json';
  const HTTP_GET_METHOD = 'GET';
  const HTTP_POST_METHOD = 'POST';
  const HTTP_PUT_METHOD = 'PUT';
  const HTTP_DELETE_METHOD = 'DELETE';

  // Error messages for service-specific validations
  const INVALID_PERMIT_ID_ERROR = 'Invalid permit ID provided';
  const SERVER_ERROR_TEXT = 'Server Error';
  const INTERNAL_SERVER_ERROR_TEXT = 'Internal Server Error';
  const INVALID_SERVER_RESPONSE_ERROR = 'Invalid server response';

  // Test failure messages
  const SHOULD_HAVE_FAILED_VALIDATION = 'Should have failed validation';
  const SHOULD_HAVE_FAILED_DUE_TO_VALIDATION =
    'Should have failed due to validation error';
  const SHOULD_HAVE_FAILED = 'Should have failed';
  const SHOULD_HAVE_REJECTED_EMPTY_ID = 'Should have rejected empty ID';
  const SHOULD_HAVE_REJECTED_WHITESPACE_ID =
    'Should have rejected whitespace ID';

  // Test data
  const INVALID_DATA_OBJECT = { invalid: 'data' };
  const INCOMPLETE_RESPONSE_OBJECT = { incomplete: 'response' };
  const INVALID_RESPONSE_ARRAY = [{ invalid: 'response' }];
  const APPROVED_STATUS = 'APPROVED';
  const EMPTY_STRING = '';
  const WHITESPACE_STRING = '   ';

  beforeEach(() => {
    // Create validation service spy
    const validationSpy = jasmine.createSpyObj('PermitValidationService', [
      'validateInputPermit',
      'validateAndFilterPermits',
      'validateSinglePermitResponse',
      'isValidPermit',
      'getValidationErrorMessage',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PermitService,
        { provide: PermitValidationService, useValue: validationSpy },
      ],
    });

    service = TestBed.inject(PermitService);
    httpMock = TestBed.inject(HttpTestingController);
    validationServiceSpy = TestBed.inject(
      PermitValidationService
    ) as jasmine.SpyObj<PermitValidationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty permits signal', () => {
      expect(service.permits()).toEqual([]);
    });
  });

  describe('requestAllPermits', () => {
    beforeEach(() => {
      // Default: validation service returns data unchanged
      validationServiceSpy.validateAndFilterPermits.and.returnValue(
        MOCK_PERMITS
      );
    });

    it('should fetch and validate permits successfully', () => {
      service.requestAllPermits().subscribe((permits) => {
        expect(permits).toEqual(MOCK_PERMITS);
      });

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe(HTTP_GET_METHOD);
      expect(req.request.headers.get(CONTENT_TYPE_HEADER)).toBe(
        APPLICATION_JSON
      );
      req.flush(MOCK_PERMITS);

      // Verify validation was called
      expect(
        validationServiceSpy.validateAndFilterPermits
      ).toHaveBeenCalledWith(MOCK_PERMITS);
    });

    it('should handle validation filtering', () => {
      const serverResponse = [
        MOCK_PERMITS[0],
        INVALID_DATA_OBJECT,
        MOCK_PERMITS[1],
      ];
      const filteredResponse = [MOCK_PERMITS[0], MOCK_PERMITS[1]];

      validationServiceSpy.validateAndFilterPermits.and.returnValue(
        filteredResponse
      );

      service.requestAllPermits().subscribe((permits) => {
        expect(permits).toEqual(filteredResponse);
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush(serverResponse);

      expect(
        validationServiceSpy.validateAndFilterPermits
      ).toHaveBeenCalledWith(serverResponse);
    });

    it('should handle validation errors', () => {
      validationServiceSpy.validateAndFilterPermits.and.throwError(
        new ValidationError(VALIDATION_ERROR)
      );

      service.requestAllPermits().subscribe({
        next: () => fail(SHOULD_HAVE_FAILED_DUE_TO_VALIDATION),
        error: (error) => {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.message).toBe(VALIDATION_ERROR);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush(INVALID_RESPONSE_ARRAY);
    });

    it('should handle fetch HTTP errors', () => {
      service.requestAllPermits().subscribe({
        next: () => fail(SHOULD_HAVE_FAILED),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush(SERVER_ERROR_TEXT, {
        status: ERROR_STATUS,
        statusText: INTERNAL_SERVER_ERROR_TEXT,
      });
    });
  });

  describe('createPermit', () => {
    beforeEach(() => {
      // Default: validation passes
      validationServiceSpy.validateInputPermit.and.stub();
      validationServiceSpy.validateSinglePermitResponse.and.returnValue(
        createThisPermit
      );
    });

    it('should validate input and create permit successfully', () => {
      const newPermit = createThisPermit;

      service.createPermit(newPermit).subscribe((permit) => {
        expect(permit).toEqual(newPermit);
      });

      // Verify optimistic update occurred
      expect(service.permits()).toContain(newPermit);

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe(HTTP_POST_METHOD);
      expect(req.request.body).toEqual(JSON.stringify(newPermit));
      req.flush(newPermit);

      // Verify validation was called
      expect(validationServiceSpy.validateInputPermit).toHaveBeenCalledWith(
        newPermit
      );
      expect(
        validationServiceSpy.validateSinglePermitResponse
      ).toHaveBeenCalledWith(newPermit);
    });

    it('should reject invalid input before making HTTP request', () => {
      const invalidPermit = INVALID_DATA_OBJECT as any;
      validationServiceSpy.validateInputPermit.and.throwError(VALIDATION_ERROR);

      service.createPermit(invalidPermit).subscribe({
        next: () => fail(SHOULD_HAVE_FAILED_VALIDATION),
        error: (error) => {
          expect(error.message).toBe(VALIDATION_ERROR);
        },
      });

      // Should not make HTTP request
      httpMock.expectNone(BASE_URL);
      expect(validationServiceSpy.validateInputPermit).toHaveBeenCalledWith(
        invalidPermit
      );
    });

    it('should handle invalid server response', () => {
      const newPermit = createThisPermit;
      const invalidResponse = INCOMPLETE_RESPONSE_OBJECT;

      validationServiceSpy.validateSinglePermitResponse.and.throwError(
        INVALID_SERVER_RESPONSE_ERROR
      );

      service.createPermit(newPermit).subscribe({
        next: () => fail(SHOULD_HAVE_FAILED_VALIDATION),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR); // ← Change this line
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush(invalidResponse);

      expect(
        validationServiceSpy.validateSinglePermitResponse
      ).toHaveBeenCalledWith(invalidResponse);
    });

    it('should rollback optimistic update on HTTP error', () => {
      const newPermit = createThisPermit;
      const initialPermits = service.permits();

      service.createPermit(newPermit).subscribe({
        next: () => fail(SHOULD_HAVE_FAILED),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
          // Verify rollback occurred
          expect(service.permits()).toEqual(initialPermits);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush(SERVER_ERROR_TEXT, {
        status: ERROR_STATUS,
        statusText: INTERNAL_SERVER_ERROR_TEXT,
      });
    });
  });

  describe('updatePermit', () => {
    beforeEach(() => {
      validationServiceSpy.validateInputPermit.and.stub();
      validationServiceSpy.validateSinglePermitResponse.and.returnValue(
        updatePermit
      );
    });

    it('should validate input and update permit successfully', () => {
      const existingPermit = createThisPermit;
      const updatedPermit = { ...existingPermit, status: APPROVED_STATUS };

      // Set up initial state
      service.permits.set([existingPermit]);

      service.updatePermit(updatedPermit).subscribe((permit) => {
        expect(permit).toEqual(updatedPermit);
      });

      // Verify optimistic update
      expect(service.permits()[0]).toEqual(updatedPermit);

      const req = httpMock.expectOne(`${BASE_URL}/${updatedPermit.id}`);
      expect(req.request.method).toBe(HTTP_PUT_METHOD);
      expect(req.request.body).toEqual(updatedPermit);
      req.flush(updatedPermit);

      // Verify validation calls
      expect(validationServiceSpy.validateInputPermit).toHaveBeenCalledWith(
        updatedPermit
      );
      expect(
        validationServiceSpy.validateSinglePermitResponse
      ).toHaveBeenCalledWith(updatedPermit);
    });

    it('should reject invalid input before HTTP request', () => {
      const invalidPermit = INVALID_DATA_OBJECT as any;
      validationServiceSpy.validateInputPermit.and.throwError(VALIDATION_ERROR);

      service.updatePermit(invalidPermit).subscribe({
        next: () => fail(SHOULD_HAVE_FAILED_VALIDATION),
        error: (error) => {
          expect(error.message).toBe(VALIDATION_ERROR);
        },
      });

      httpMock.expectNone(`${BASE_URL}/${invalidPermit.id}`);
    });
  });

  describe('deletePermit', () => {
    it('should delete permit with valid ID', () => {
      const permitId = deleteThisPermit.id;

      service.deletePermit(permitId).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${BASE_URL}/${permitId}`);
      expect(req.request.method).toBe(HTTP_DELETE_METHOD);
      req.flush(null);
    });

    it('should reject empty or whitespace permit ID', () => {
      service.deletePermit(EMPTY_STRING).subscribe({
        next: () => fail(SHOULD_HAVE_REJECTED_EMPTY_ID),
        error: (error) => {
          expect(error.message).toBe(INVALID_PERMIT_ID_ERROR);
        },
      });

      service.deletePermit(WHITESPACE_STRING).subscribe({
        next: () => fail(SHOULD_HAVE_REJECTED_WHITESPACE_ID),
        error: (error) => {
          expect(error.message).toBe(INVALID_PERMIT_ID_ERROR);
        },
      });

      httpMock.expectNone(`${BASE_URL}/`);
      httpMock.expectNone(`${BASE_URL}/${WHITESPACE_STRING}`);
    });

    it('should rollback optimistic delete on HTTP error', () => {
      const permitId = deleteThisPermit.id;

      // Set up initial state
      service.permits.set([deleteThisPermit, createThisPermit]);
      const initialPermits = service.permits();

      service.deletePermit(permitId).subscribe({
        next: () => fail(SHOULD_HAVE_FAILED),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
          expect(service.permits()).toEqual(initialPermits);
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}/${permitId}`);
      req.flush(SERVER_ERROR_TEXT, {
        status: ERROR_STATUS,
        statusText: INTERNAL_SERVER_ERROR_TEXT,
      });
    });
  });
});
