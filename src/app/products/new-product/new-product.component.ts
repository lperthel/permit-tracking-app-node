import {
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import {
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';

import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from '../product-form.model';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  errorMessages = {
    invalidName: 'Name is required and must be less than 256 characters',
    invalidDescription:
      'Description is required and must be less than 256 characters',
    invalidPrice:
      'Price is required, must be less than 256 characters, and follow the formatting of USD.',
    invalidQuantity:
      'Quantity is required, must be less than 256 characters, and must be numeric',
  };

  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private router: Router
  ) {}
  productForm = new ProductForm();
  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
          this.createProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  createProduct() {
    console.log('form submitted');
    this.productForm.form.markAllAsTouched();

    if (this.productForm.form.invalid) {
      return;
    }

    const product: Product = {
      id: UUID.UUID(),
      name: this.productForm.form.value.name || '',
      description: this.productForm.form.value.description || '',
      price: this.productForm.form.value.price || '',
      quantity: parseInt(this.productForm.form.value.quantity || '0', 10),
    };

    const sub = this.productService.createProduct(product).subscribe({
      next: (val) => {
        this.productService.products.update((oldProducts) => [
          ...oldProducts,
          product,
        ]);
        this.modalService.dismissAll('save-click');
      },
    });
    this.productService.closeConnection(sub);
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }
}
