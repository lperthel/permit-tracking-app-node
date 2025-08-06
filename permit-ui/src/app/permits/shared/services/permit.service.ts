import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, Subscription, throwError } from 'rxjs';
import {
  API_CONSTANTS,
  LOGGING_CONSTANTS,
} from '../../../assets/constants/service.constants';
import { UI_TEXT } from '../../../assets/constants/ui-text.constants';
import { Permit } from '../models/permit.model';
import { PermitValidationService } from './permit-validation.service';

@Injectable({ providedIn: 'root' })
export class PermitService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': API_CONSTANTS.CONTENT_TYPE_JSON,
    }),
  };

  permits = signal<Permit[]>([]);
  successfulPermitRetirevalMessage = UI_TEXT.PERMITS_UPDATED_SUCCESS;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly destroyRef: DestroyRef,
    private readonly validator: PermitValidationService // ✅ Inject validation service
  ) {}

  createPermit(permit: Permit): Observable<Permit> {
    // Validate input before processing
    this.validator.validateInputPermit(permit);

    const backupPermits = this.permits();
    this.permits.update((permits) => [...permits, permit]);

    return this.httpClient
      .post<any>(
        API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH,
        JSON.stringify(permit),
        this.httpOptions
      )
      .pipe(
        // Validate server response
        map((response) =>
          this.validator.validateSinglePermitResponse(response)
        ),
        catchError((err) => {
          console.error(
            LOGGING_CONSTANTS.CREATE_ERROR_PREFIX,
            permit.id,
            LOGGING_CONSTANTS.STATUS_LOG,
            err.status
          );
          this.permits.set(backupPermits);
          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  get requestAllPermits(): Observable<Permit[]> {
    return this.httpClient
      .get<any[]>(
        API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH,
        this.httpOptions
      )
      .pipe(
        // Validate and filter response data
        map((data) => this.validator.validateAndFilterPermits(data)),
        catchError((err) => {
          console.error(LOGGING_CONSTANTS.FETCH_ERROR_PREFIX, err.status);
          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  updatePermit(newPermit: Permit): Observable<Permit> {
    // Validate input before processing
    this.validator.validateInputPermit(newPermit);

    const backupPermits = this.permits();

    this.permits.update((permits) => {
      return permits.map((oldPermit) => {
        return oldPermit.id === newPermit.id ? newPermit : oldPermit;
      });
    });

    return this.httpClient
      .put<any>(
        API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH + newPermit.id,
        newPermit,
        this.httpOptions
      )
      .pipe(
        // Validate server response
        map((response) =>
          this.validator.validateSinglePermitResponse(response)
        ),
        catchError((err) => {
          console.error(
            LOGGING_CONSTANTS.UPDATE_ERROR_PREFIX,
            newPermit.id,
            LOGGING_CONSTANTS.STATUS_LOG,
            err.status
          );
          this.permits.set(backupPermits);
          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  deletePermit(permitId: string): Observable<void> {
    // Validate permitId
    if (!permitId || permitId.trim().length === 0) {
      return throwError(() => new Error('Invalid permit ID provided'));
    }

    const backupPermits = this.permits();

    this.permits.update((oldPermits) =>
      oldPermits.filter((permit) => permit.id !== permitId)
    );

    return this.httpClient
      .delete<void>(
        API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH + permitId,
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          console.error(
            LOGGING_CONSTANTS.DELETE_ERROR_PREFIX,
            permitId,
            LOGGING_CONSTANTS.STATUS_LOG,
            err.status
          );
          this.permits.set(backupPermits);
          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
