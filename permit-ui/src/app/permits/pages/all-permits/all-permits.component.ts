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
import { ARIA_LABELS } from '../../../assets/constants/accessibility.constants';
import {
  APP_DESCRIPTION,
  APP_HEADER,
} from '../../../assets/constants/app-description';
import { COMPONENT_CONSTANTS } from '../../../assets/constants/component-constants';
import { PAGINATION } from '../../../assets/constants/pagination.constants';
import { ROUTES } from '../../../assets/constants/routes.contstants';
import { TEST_IDS } from '../../../assets/constants/test-ids.constants';
import { UI_TEXT } from '../../../assets/constants/ui-text.constants';
import { Permit } from '../../shared/models/permit.model';
import { PermitService } from '../../shared/services/permit.service';

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
  PAGE_HEADER = APP_HEADER;
  PAGE_DESC = APP_DESCRIPTION;
  ARIA_LABELS = ARIA_LABELS;
  ROUTES = ROUTES;
  TEST_IDS = TEST_IDS;
  PAGINATION = PAGINATION;
  UI_TEXT = UI_TEXT;
  COMPONENT_CONSTANTS = COMPONENT_CONSTANTS;

  columnsToDisplay = COMPONENT_CONSTANTS.COLUMNS_TO_DISPLAY;
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
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
        this.dataSource.paginator = this.paginator();
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
    // More maintainable approach using a mapping
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
    this.isLoading.set(true); // Start loading

    const sub = this.permitService.requestAllPermits().subscribe({
      next: (resp) => {
        this.permitService.permits.set(resp);
        this.restError.set(UI_TEXT.EMPTY_ERROR);
        this.isLoading.set(false); // Stop loading
      },
      error: (err: Error) => {
        this.restError.set(err.message);
        this.isLoading.set(false); // Stop loading on error
      },
    });
    this.permitService.closeConnection(sub);
  }

  onUpdate(permitId: string) {
    this.router.navigate([ROUTES.UPDATE(permitId)]);
  }

  onDelete(permitId: string) {
    const sub = this.permitService.deletePermit(permitId).subscribe({
      next: (_resp) => this.restError.set(UI_TEXT.EMPTY_ERROR),
      error: (err: Error) => this.restError.set(err.message),
    });

    this.permitService.closeConnection(sub);

    this.router.navigate([ROUTES.ROOT_PAGE], {
      relativeTo: this.activatedRoute,
      onSameUrlNavigation: 'reload',
      queryParamsHandling: 'preserve',
    });
  }
}
