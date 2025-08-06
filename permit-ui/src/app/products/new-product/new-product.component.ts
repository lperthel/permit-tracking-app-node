import {
  Component,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';

import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import DOMPurify from 'dompurify';
import {
  PRODUCT_FORM_ERRORS,
  PRODUCT_FORM_HEADERS,
} from '../product-form-model/product-form-constants';
import { ProductForm } from '../product-form-model/product-form.model';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule, NgbAlertModule, ProductFormComponent],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  errorMessages = PRODUCT_FORM_ERRORS;
  modalHeader = PRODUCT_FORM_HEADERS.newProduct;

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    public productForm: ProductForm
  ) {}

  productFormComponent =
    viewChild.required<ProductFormComponent>('productFormElement');
  closeResult: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.productFormComponent().openModal();
  }

  createProduct() {
    this.productForm.form.markAllAsTouched();

    const rawName = this.productForm.form.value.name!;
    DOMPurify.sanitize(rawName);
    const rawDescription = this.productForm.form.value.description ?? '';
    DOMPurify.sanitize(rawDescription);

    if (this.productForm.form.invalid) {
      return;
    }

    if (this.productForm.form.value.price?.indexOf('.') == -1) {
      this.productForm.form.value.price.concat('.00');
    }

    const product: Product = {
      id: uuidv4(),
      name: this.productForm.form.value.name!,
      description: this.productForm.form.value.description!,
      price: this.productForm.form.value.price!,
      quantity: parseInt(this.productForm.form.value.quantity!),
    };

    const sub = this.productService.createProduct(product).subscribe({
      next: (_resp) => {
        this.productFormComponent().restError.set('');
        this.productFormComponent().dismissModal('save-click');
      },
      error: (err: Error) => {
        this.productFormComponent().restError.set(err.message);
      },
    });
    this.productService.closeConnection(sub);
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }

  handleFormSubmission() {
    this.createProduct();
  }
  handleCloseModal() {
    this.router.navigateByUrl('/');
  }
}
