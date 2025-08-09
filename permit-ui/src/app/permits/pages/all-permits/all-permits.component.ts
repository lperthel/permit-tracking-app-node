import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ROUTE_CONSTANTS } from '../../../app.routes';
import { PAGINATION } from '../../../assets/constants/pagination.constants';
import { UI_TEXT } from '../../../assets/constants/ui-text.constants';
import { Permit } from '../../shared/models/permit.model';
import { PermitService } from '../../shared/services/permit.service';
import { AllPermitsComponentConstants } from './all-permits-component.constants';

/**
 * AllPermitsComponent - Displays paginated table of permits
 *
 * EVENT FLOW:
 * =====================
 * 1. ngOnInit() - Set up subscription and load data
 * 2. ngAfterViewInit() - Connect paginator
 * 3. Data loads - Update table via subscription
 *
 */
@Component({
  selector: 'app-all-permits',
  imports: [
    RouterOutlet,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    NgbAlertModule,
  ],
  templateUrl: './all-permits.component.html',
  styleUrl: './all-permits.component.css',
})
export class AllPermitsComponent implements OnInit, AfterViewInit {
  isLoading = signal<boolean>(false);

  // Replace your hardcoded columnsToDisplay with:
  columnsToDisplay: string[] = AllPermitsComponentConstants.COLUMNS_TO_DISPLAY;

  // Replace your hardcoded pageSize with:
  pageSize: number = AllPermitsComponentConstants.PAGINATION.DEFAULT_PAGE_SIZE;

  // Make sure you're importing and using the other constants too:
  protected readonly UI_TEXT = AllPermitsComponentConstants.UI_TEXT;
  protected readonly ARIA_LABELS = AllPermitsComponentConstants.ARIA_LABELS;
  protected readonly TEST_IDS = AllPermitsComponentConstants.TEST_IDS;
  protected readonly ROUTES = ROUTE_CONSTANTS;
  protected readonly PAGINATION = AllPermitsComponentConstants.PAGINATION;
  protected readonly PAGE_HEADER = AllPermitsComponentConstants.APP_HEADER;
  protected readonly PAGE_DESC = AllPermitsComponentConstants.APP_DESCRIPTION;

  paginator = viewChild.required<MatPaginator>(MatPaginator);
  restError = signal<string>(this.UI_TEXT.EMPTY_ERROR);
  manuallyUpdatePermitsSuccessful = signal<string>(UI_TEXT.EMPTY_ERROR);
  dataSource = new MatTableDataSource<Permit>();
  permitService = inject(PermitService);
  private readonly permits$ = toObservable(this.permitService.permits);

  ngOnInit(): void {
    const sub = this.permits$.subscribe({
      next: (_resp) => {
        this.dataSource.data = this.permitService.permits();
      },
      error: (err) => {
        console.error(err);
        this.restError.set(err);
      },
    });
    this.permitService.closeConnection(sub);
    this.refreshPermitsFromDB();
  }

  ngAfterViewInit(): void {
    // Simple - paginator exists immediately, connect it
    this.dataSource.paginator = this.paginator();

    // Set up pagination button test IDs
    const paginationButtons = [
      {
        selector: PAGINATION.PAGINATION_SELECTORS.NEXT,
        testId: PAGINATION.PAGINATION_TEST_IDS.NEXT,
      },
      {
        selector: PAGINATION.PAGINATION_SELECTORS.PREV,
        testId: PAGINATION.PAGINATION_TEST_IDS.PREV,
      },
      {
        selector: PAGINATION.PAGINATION_SELECTORS.LAST,
        testId: PAGINATION.PAGINATION_TEST_IDS.LAST,
      },
      {
        selector: PAGINATION.PAGINATION_SELECTORS.FIRST,
        testId: PAGINATION.PAGINATION_TEST_IDS.FIRST,
      },
    ];

    paginationButtons.forEach(({ selector, testId }) => {
      const button = document.querySelector(selector);
      if (button) {
        button.setAttribute('data-testid', testId);
      }
    });
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  refreshPermitsFromDB() {
    this.isLoading.set(true);

    const sub = this.permitService.requestAllPermits().subscribe({
      next: (resp) => {
        this.permitService.permits.set(resp);
        this.restError.set(UI_TEXT.EMPTY_ERROR);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.restError.set(err.message);
        this.isLoading.set(false);
      },
    });
    this.permitService.closeConnection(sub);
  }

  onDelete(permitId: string) {
    const sub = this.permitService.deletePermit(permitId).subscribe({
      next: (_resp) => this.restError.set(UI_TEXT.EMPTY_ERROR),
      error: (err: Error) => this.restError.set(err.message),
    });

    this.permitService.closeConnection(sub);

    this.router.navigate([this.ROUTES.ROOT_PAGE], {
      relativeTo: this.activatedRoute,
      onSameUrlNavigation: 'reload',
      queryParamsHandling: 'preserve',
    });
  }
}
