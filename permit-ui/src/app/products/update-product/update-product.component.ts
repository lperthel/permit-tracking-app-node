import { Component, input, OnInit, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import {
  PRODUCT_FORM_ERRORS,
  PRODUCT_FORM_HEADERS,
} from '../product-form-model/product-form-constants';
import { ProductForm } from '../product-form-model/product-form.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule, NgbAlertModule, ProductFormComponent],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit {
  errorMessages = PRODUCT_FORM_ERRORS;
  modalHeader = PRODUCT_FORM_HEADERS.updateProduct;
  productId = input.required<string>();
  private product!: Product;
  foundProduct: Product | undefined;

  productFormComponent =
    viewChild.required<ProductFormComponent>('productFormElement');

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    public productForm: ProductForm
  ) {}

  ngOnInit() {
    this.foundProduct = this.productService
      .products()
      .find((product) => this.productId() === product.id);

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
    this.productFormComponent().openModal();
  }

  updateProduct() {
    if (this.productForm.form.invalid) {
      return;
    }
    const newProduct: Product = {
      id: this.product.id,
      name: this.productForm.form.value['name']!,
      description: this.productForm.form.value['description']!,
      price: this.productForm.form.value.price!,
      quantity: parseInt(this.productForm.form.value.quantity!),
    };

    const subscription = this.productService
      .updateProduct(newProduct)
      .subscribe({
        next: (_resp) => {
          this.productFormComponent().restError.set('');
          this.productFormComponent().dismissModal('save-click');

          this.router.navigateByUrl('/');
        },
        error: (err: Error) =>
          this.productFormComponent().restError.set(err.message),
      });

    this.productService.closeConnection(subscription);
  }

  handleFormSubmission() {
    this.updateProduct();
  }
  handleCloseModal() {
    this.router.navigateByUrl('/');
  }
}
