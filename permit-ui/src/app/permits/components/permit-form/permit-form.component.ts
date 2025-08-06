// @ts-ignore - TODO: Fix during refactor
import {
  Component,
  EventEmitter,
  input,
  Output,
  output,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PERMIT_FORM_ERRORS } from '../../permit-form-model/permit-form-constants';
import { PermitForm } from '../../permit-form-model/permit-form.model';

@Component({
  selector: 'app-permit-form',
  imports: [ReactiveFormsModule, NgbAlertModule],
  templateUrl: './permit-form.component.html',
  styleUrl: './permit-form.component.css',
})
export class PermitFormComponent {
  errorMessages = PERMIT_FORM_ERRORS;
  permitForm = input.required<PermitForm>();
  formHeader = input.required<string>();

  public closeModalEvent = output<void>();
  @Output() public formSubmission = new EventEmitter<void>();
  restError = signal<string>('');

  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');

  constructor(private readonly modalService: NgbModal) {}

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
        (_reason) => {
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
