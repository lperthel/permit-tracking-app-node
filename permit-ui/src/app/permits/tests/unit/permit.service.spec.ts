import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import {
  createThisPermit,
  deleteThisPermit,
  updatePermit,
} from '../../../assets/constants/test-permits';
import { Permit } from '../../shared/models/permit.model';
import { PermitValidationService } from '../../shared/services/permit-validation.service';
import { PermitService } from '../../shared/services/permit.service';

describe('PermitService', () => {
  let service: PermitService;
  let httpMock: HttpTestingController;
  let validationServiceSpy: jasmine.SpyObj<PermitValidationService>;

  // Constants defined at top of describe block
  const BASE_URL = `${environment.apiUrl}/permits`;
  const MOCK_PERMITS: Permit[] = [createThisPermit, updatePermit];
  const ERROR_STATUS = 500;
  const VALIDATION_ERROR = 'Invalid permit data provided';
  const SERVER_ERROR = 'Server connection error';

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
      service.requestAllPermits.subscribe((permits) => {
        expect(permits).toEqual(MOCK_PERMITS);
      });

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(MOCK_PERMITS);

      // Verify validation was called
      expect(
        validationServiceSpy.validateAndFilterPermits
      ).toHaveBeenCalledWith(MOCK_PERMITS);
    });

    it('should handle validation filtering', () => {
      const serverResponse = [
        MOCK_PERMITS[0],
        { invalid: 'data' },
        MOCK_PERMITS[1],
      ];
      const filteredResponse = [MOCK_PERMITS[0], MOCK_PERMITS[1]];

      validationServiceSpy.validateAndFilterPermits.and.returnValue(
        filteredResponse
      );

      service.requestAllPermits.subscribe((permits) => {
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
        VALIDATION_ERROR
      );

      service.requestAllPermits.subscribe({
        next: () => fail('Should have failed due to validation error'),
        error: (error) => {
          expect(error.message).toBe(VALIDATION_ERROR);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush([{ invalid: 'response' }]);
    });

    it('should handle fetch HTTP errors', () => {
      service.requestAllPermits.subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush('Server Error', {
        status: ERROR_STATUS,
        statusText: 'Internal Server Error',
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
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(JSON.stringify(newPermit));
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
      const invalidPermit = { invalid: 'data' } as any;
      validationServiceSpy.validateInputPermit.and.throwError(VALIDATION_ERROR);

      service.createPermit(invalidPermit).subscribe({
        next: () => fail('Should have failed validation'),
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
      const invalidResponse = { incomplete: 'response' };

      validationServiceSpy.validateSinglePermitResponse.and.throwError(
        'Invalid server response'
      );

      service.createPermit(newPermit).subscribe({
        next: () => fail('Should have failed validation'),
        error: (error) => {
          expect(error.message).toBe('Invalid server response');
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
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
          // Verify rollback occurred
          expect(service.permits()).toEqual(initialPermits);
        },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush('Server Error', {
        status: ERROR_STATUS,
        statusText: 'Internal Server Error',
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
      const updatedPermit = { ...existingPermit, status: 'APPROVED' };

      // Set up initial state
      service.permits.set([existingPermit]);

      service.updatePermit(updatedPermit).subscribe((permit) => {
        expect(permit).toEqual(updatedPermit);
      });

      // Verify optimistic update
      expect(service.permits()[0]).toEqual(updatedPermit);

      const req = httpMock.expectOne(`${BASE_URL}/${updatedPermit.id}`);
      expect(req.request.method).toBe('PUT');
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
      const invalidPermit = { invalid: 'data' } as any;
      validationServiceSpy.validateInputPermit.and.throwError(VALIDATION_ERROR);

      service.updatePermit(invalidPermit).subscribe({
        next: () => fail('Should have failed validation'),
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
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should reject empty or whitespace permit ID', () => {
      service.deletePermit('').subscribe({
        next: () => fail('Should have rejected empty ID'),
        error: (error) => {
          expect(error.message).toBe('Invalid permit ID provided');
        },
      });

      service.deletePermit('   ').subscribe({
        next: () => fail('Should have rejected whitespace ID'),
        error: (error) => {
          expect(error.message).toBe('Invalid permit ID provided');
        },
      });

      httpMock.expectNone(`${BASE_URL}/`);
      httpMock.expectNone(`${BASE_URL}/   `);
    });

    it('should rollback optimistic delete on HTTP error', () => {
      const permitId = deleteThisPermit.id;

      // Set up initial state
      service.permits.set([deleteThisPermit, createThisPermit]);
      const initialPermits = service.permits();

      service.deletePermit(permitId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(SERVER_ERROR);
          expect(service.permits()).toEqual(initialPermits);
        },
      });

      const req = httpMock.expectOne(`${BASE_URL}/${permitId}`);
      req.flush('Server Error', {
        status: ERROR_STATUS,
        statusText: 'Internal Server Error',
      });
    });
  });
});
