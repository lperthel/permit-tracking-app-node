import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, Subscription, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  API_CONSTANTS,
  LOGGING_CONSTANTS,
} from '../../../assets/constants/service.constants';
import { UI_TEXT } from '../../../assets/constants/ui-text.constants';
import { Permit } from '../models/permit.model';
import {
  PermitValidationService,
  ValidationError,
} from './permit-validation.service';

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
  ) { }

  createPermit(permit: Permit): Observable<Permit> {
    return new Observable<Permit>((observer) => {
      try {
        this.validator.validateInputPermit(permit); // Validate the passed permit
        observer.next(permit); // Emit the permit to the inner observable
        observer.complete(); // Signal completion
      } catch (error) {
        observer.error(error); // Emit ValidationError if invalid
      }
    }).pipe(
      switchMap((permit: Permit) => { //map each emitted permit to a new observable and automatically subscribe to it
        const backupPermits = this.permits();
        this.permits.update((permits) => [...permits, permit]);

        return this.httpClient  //automatically subscribe to
          .post<Permit>(
            API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH,
            JSON.stringify(permit),
            this.httpOptions
          )
          .pipe( //We're looking at the response and will trickle up the result
            map((response) =>
              //this returns the validated permit and will be acted on in the subscriber
              this.validator.validateSinglePermitResponse(response)
            ),
            catchError((_err) => {
              this.permits.set(backupPermits);
              return throwError(
                () => new Error(UI_TEXT.SERVER_CONNECTION_ERROR)
              );
            })
          );
      })
    );
  }

  requestAllPermits(): Observable<Permit[]> {
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

          // Let ValidationError pass through, convert others to server error
          if (err instanceof ValidationError) {
            return throwError(() => err);
          }

          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  updatePermit(newPermit: Permit): Observable<Permit> {
    return new Observable<Permit>((observer) => {
      try {
        this.validator.validateInputPermit(newPermit); //validate the passed permit
        observer.next(newPermit); //emit the permit
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    }).pipe(
      switchMap((newPermit: Permit) => {//map each emitted permit to a new observable
        const backupPermits = this.permits();

        this.permits.update((permits) => {
          return permits.map((oldPermit) => {
            return oldPermit.id === newPermit.id ? newPermit : oldPermit;
          });
        });

        return this.httpClient //automatically subscribed to
          .put<any>(
            API_CONSTANTS.SERVER_URL +
            API_CONSTANTS.PERMITS_PATH +
            newPermit.id,
            JSON.stringify(newPermit),
            this.httpOptions
          )
          .pipe(
            map((response) => //We're looking at the response and will trickle up the result
              //this returns the validated permit and will be acted on in the subscriber
              this.validator.validateSinglePermitResponse(response)
            ),
            catchError((err) => {
              console.error(
                LOGGING_CONSTANTS.UPDATE_ERROR_PREFIX,
                newPermit.id,
                LOGGING_CONSTANTS.STATUS_LOG,
                err.status
              );
              this.permits.set(backupPermits); //rollback the update if it fails
              return throwError(
                () => new Error(UI_TEXT.SERVER_CONNECTION_ERROR)
              );
            })
          );
      })
    );
  }

  deletePermit(permitId: string): Observable<void> {
    // Validate permitId
    if (!permitId || permitId.trim().length === 0) {
      return throwError(() => new Error('Invalid permit ID provided'));
    }

    // DON'T update permits immediately - wait for HTTP success
    return this.httpClient
      .delete<void>(
        API_CONSTANTS.SERVER_URL + API_CONSTANTS.PERMITS_PATH + permitId,
        this.httpOptions
      )
      .pipe(
        map((response) => {
          // SUCCESS: Now remove the permit from the store
          this.permits.update((oldPermits) =>
            oldPermits.filter((permit) => permit.id !== permitId)
          );
          return response;
        }),
        catchError((err) => {
          console.error(
            LOGGING_CONSTANTS.DELETE_ERROR_PREFIX,
            permitId,
            LOGGING_CONSTANTS.STATUS_LOG,
            err.status
          );
          // No need to restore backup since we never changed the store
          return throwError(() => new Error(UI_TEXT.SERVER_CONNECTION_ERROR));
        })
      );
  }

  closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
