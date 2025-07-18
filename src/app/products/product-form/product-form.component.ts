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
  errorMessages = PRODUCT_FORM_ERRORS;
  productForm = input.required<ProductForm>();
  formHeader = input.required<string>();
  // public formSubmission = output<ProductForm>();
  public closeModalEvent = output<void>();
  @Output() public formSubmission = new EventEmitter<void>();
  restError = signal<string>('');

  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');

  constructor(private modalService: NgbModal) {}

  openModal() {
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
          this.closeModalEvent.emit();
        },
        (reason) => {
          this.closeModalEvent.emit();
        }
      );
  }

  dismissModal(reason: string) {
    this.modalService.dismissAll(reason);
  }

  onSubmit() {
    this.formSubmission.emit();
  }
}
