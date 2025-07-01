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
import { v4 as uuidv4 } from 'uuid';
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

import { NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from '../product-form.model';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule, NgbAlertModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private router: Router
  ) {}
  productForm = new ProductForm();
  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');
  restError = signal<string>('');

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
      uuid: uuidv4(),
      name: this.productForm.form.value.name!,
      description: this.productForm.form.value.description!,
      price: this.productForm.form.value.price!,
      quantity: parseInt(this.productForm.form.value.quantity!),
    };

    const sub = this.productService.createProduct(product).subscribe({
      next: (val) => {
        this.restError.set('');
        this.modalService.dismissAll('save-click');
      },
      error: (err: Error) => {
        this.restError.set(err.message);
      },
    });
    this.productService.closeConnection(sub);
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }
}
