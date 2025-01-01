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
  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');
  private fb = inject(NonNullableFormBuilder);

  patterns = {
    price: '^[0-9]{1,253}(\\.[0-9]{1,2})?$',
    quantity: '^[0-9]{1,255}$',
  };

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.required, Validators.maxLength(255)],
    price: [
      '',
      [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(this.patterns.price),
      ],
    ],
    quantity: [
      '',
      [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(this.patterns.quantity),
      ],
    ],
  });

  get invalidName() {
    return this.form.controls.name.touched && this.form.controls.name.invalid;
  }

  get invalidDescription() {
    return (
      this.form.controls.description.touched &&
      this.form.controls.description.invalid
    );
  }

  get invalidPrice() {
    return this.form.controls.price.touched && this.form.controls.price.invalid;
  }

  get invalidQuanity() {
    return (
      this.form.controls.quantity.touched && this.form.controls.quantity.invalid
    );
  }

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
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const product: Product = {
      id: UUID.UUID(),
      name: this.form.value.name || '',
      description: this.form.value.description || '',
      price: this.form.value.price || '',
      quantity: parseInt(this.form.value.quantity || '0', 10),
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
