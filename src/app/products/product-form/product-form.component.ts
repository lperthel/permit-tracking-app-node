import {
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  output,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ProductForm } from '../product-form-model/product-form.model';
import { PRODUCT_FORM_ERRORS } from '../product-form-model/product-form-constants';
import { NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, NgbAlertModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  public formHeader = input.required<string>();
  errorMessages = PRODUCT_FORM_ERRORS;
  public productForm = inject(ProductForm);
  // public formSubmission = output<ProductForm>();
  @Output() public formSubmission = new EventEmitter<ProductForm>();
  restError = signal<string>('');

  consturctor() {}

  onSubmit() {
    this.formSubmission.emit(this.productForm);
  }
}
