import {
  Component,
  input,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from '../product-form.model';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule, NgbAlertModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit {
  productId = input.required<string>();
  private product!: Product;
  foundProduct: Product | undefined;
  restError = signal<string>('');
  modal = viewChild.required<TemplateRef<any>>('content');
  productForm = new ProductForm();

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    console.log(`productId: ${this.productId}`);
    this.foundProduct = this.productService
      .products()
      .find((product) => this.productId() === product.uuid);

    if (!this.foundProduct) {
      console.error('could not get product for id ' + this.productId);
    } else {
      this.product = this.foundProduct;
      this.productForm.form.reset();
      this.productForm.form.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity.toString(),
      });
    }
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.updateProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  updateProduct() {
    if (this.productForm.form.invalid) {
      return;
    }
    const newProduct: Product = {
      uuid: this.product.uuid,
      name: this.productForm.form.value['name']!,
      description: this.productForm.form.value['description']!,
      price: this.productForm.form.value.price!,
      quantity: parseInt(this.productForm.form.value.quantity!),
    };

    const subscription = this.productService
      .updateProduct(newProduct)
      .subscribe({
        next: (resp) => {
          this.restError.set('');
          this.modalService.dismissAll('save-click');

          this.router.navigateByUrl('/');
        },
        error: (err: Error) => this.restError.set(err.message),
      });

    this.productService.closeConnection(subscription);
  }
}
