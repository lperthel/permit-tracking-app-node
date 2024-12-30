import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-all-products',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './all-products.component.html',
  styleUrl: './all-products.component.css',
})
export class AllProductsComponent implements OnInit {
  private writeFailed = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    public productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sub = this.productService.requestAllProducts.subscribe({
      next: (resp) => {
        this.productService.products.set(resp);
      },
      error: (err) => console.log(err),
    });
  }

  onUpdate(productId: string) {
    this.router.navigate(['/update', productId]);
  }

  onDelete(productId: string) {
    this.productService.deletProduct(productId).subscribe({
      error: (err) => {
        this.writeFailed = true;
        console.log(err);
      },
    });

    if (this.writeFailed) {
      this.writeFailed = false;
    } else {
      this.productService.products.set(
        this.productService
          .products()
          .filter((product) => product.id != productId)
      );
    }

    this.router.navigate(['/'], {
      relativeTo: this.activatedRoute,
      onSameUrlNavigation: 'reload',
      queryParamsHandling: 'preserve',
    });
  }
}
