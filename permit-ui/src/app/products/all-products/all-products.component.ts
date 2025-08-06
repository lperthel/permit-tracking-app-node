import { CurrencyPipe } from '@angular/common';
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
import {
  APP_DESCRIPTION,
  APP_HEADER,
} from '../../assets/constants/app-description';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';

@Component({
  selector: 'app-all-products',
  imports: [
    CurrencyPipe,
    RouterOutlet,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    NgbAlertModule,
  ],
  templateUrl: './all-products.component.html',
  styleUrl: './all-products.component.css',
})
export class AllProductsComponent implements OnInit, AfterViewInit {
  PAGE_HEADER = APP_HEADER;
  PAGE_DESC = APP_DESCRIPTION;

  private readonly writeFailed = false;
  columnsToDisplay = [
    'name',
    'description',
    'price',
    'quantity',
    'update',
    'delete',
  ];
  pageSize = 10;
  paginator = viewChild.required<MatPaginator>(MatPaginator);
  restError = signal<string>('');
  manuallyUpdateProductsSuccessful = signal<string>('');
  dataSource = new MatTableDataSource<Product>();
  productService = inject(ProductService);
  private readonly products$ = toObservable(this.productService.products);

  ngOnInit(): void {
    const sub = this.products$.subscribe({
      next: (_resp) => {
        this.dataSource.data = this.productService.products();
        this.dataSource.paginator = this.paginator();
      },
    });
    this.productService.closeConnection(sub);
    this.refreshProductsFromDB();
  }

  ngAfterViewInit(): void {
    //set attributes for data-testid used during Cypress testing
    const nextPageButton = document.querySelector(
      'button.mat-mdc-paginator-navigation-next'
    );
    if (nextPageButton)
      nextPageButton.setAttribute('data-testid', 'pagination-next');

    const previousPageButton = document.querySelector(
      'button.mat-mdc-paginator-navigation-previous'
    );
    if (previousPageButton)
      previousPageButton.setAttribute('data-testid', 'pagination-prev');

    const lastPageButton = document.querySelector(
      'button.mat-mdc-paginator-navigation-last'
    );

    if (lastPageButton)
      lastPageButton.setAttribute('data-testid', 'pagination-last');

    const firstPageButton = document.querySelector(
      'button.mat-mdc-paginator-navigation-first'
    );
    if (firstPageButton)
      firstPageButton.setAttribute('data-testid', 'pagination-first');
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  manuallyUpdateProductsFromDB() {
    this.manuallyUpdateProductsSuccessful.set(
      this.productService.successfulProductRetirevalMessage
    );
    this.refreshProductsFromDB();
  }

  refreshProductsFromDB() {
    const noError = '';
    const sub = this.productService.requestAllProducts.subscribe({
      next: (resp) => {
        this.productService.products.set(resp);
        this.restError.set(noError);
      },
      error: (err: Error) => this.restError.set(err.message),
    });
    this.productService.closeConnection(sub);
  }

  onUpdate(productId: string) {
    const updatePage = '/update';
    this.router.navigate([updatePage, productId]);
  }

  onDelete(productId: string) {
    const noError = '';
    const sub = this.productService.deleteProduct(productId).subscribe({
      next: (_resp) => this.restError.set(noError),
      error: (err: Error) => this.restError.set(err.message),
    });

    this.productService.closeConnection(sub);

    this.router.navigate(['/'], {
      relativeTo: this.activatedRoute,
      onSameUrlNavigation: 'reload',
      queryParamsHandling: 'preserve',
    });
  }
}
