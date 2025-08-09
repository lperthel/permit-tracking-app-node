import {
  Component,
  DestroyRef,
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
import {
  NgbAlertModule,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { PERMIT_FORM_SELECTORS } from '../../../assets/constants/permit-form.constants';
import { PERMIT_FORM_ERRORS } from '../../permit-form-model/permit-form-constants';
import { PermitForm } from '../../permit-form-model/permit-form.model';

@Component({
  selector: 'app-permit-form',
  imports: [ReactiveFormsModule, NgbAlertModule],
  templateUrl: './permit-form.component.html',
  styleUrl: './permit-form.component.css',
})
export class PermitFormComponent {
  protected readonly SELECTORS = PERMIT_FORM_SELECTORS;

  // String constants at top per coding guidelines
  private readonly MODAL_ARIA_LABEL = 'modal-basic-title';
  private readonly CLOSE_REASON_PREFIX = 'Closed with: ';

  errorMessages = PERMIT_FORM_ERRORS;
  permitForm = input.required<PermitForm>();
  formHeader = input.required<string>();

  public closeModalEvent = output<void>();
  @Output() public formSubmission = new EventEmitter<void>();
  restError = signal<string>('');

  newPermitNgModule =
    viewChild.required<TemplateRef<NgbModalRef>>('newPermitModal');

  closeResult: WritableSignal<string> = signal('');

  constructor(
    private readonly modalService: NgbModal,
    private readonly destroyRef: DestroyRef
  ) {}

  openModal() {
    this.open(this.newPermitNgModule());
  }

  open(newPermitModal: TemplateRef<NgbModalRef>): void {
    const modalRef = this.modalService.open(newPermitModal, {
      ariaLabelledBy: this.MODAL_ARIA_LABEL,
      keyboard: true,
    });

    // Handle modal closed (successful completion)
    const modalClosed = modalRef.closed.subscribe({
      next: (result) => {
        this.closeResult.set(`${this.CLOSE_REASON_PREFIX}${result}`);
        this.closeModalEvent.emit();
        this.permitForm().form.reset();
        this.handleModalSuccess(result);
      },
    });

    // Handle modal dismissed (cancelled/escaped)
    const modalDismissed = modalRef.dismissed.subscribe({
      next: (reason) => {
        this.closeModalEvent.emit();
        this.permitForm().form.reset();
        this.handleModalDismissal(reason);
      },
    });

    // Register cleanup for all subscriptions
    this.closeConnection(modalClosed);
    this.closeConnection(modalDismissed);
  }

  dismissModal(reason: string) {
    this.modalService.dismissAll(reason);
  }

  private handleModalSuccess(result: any): void {
    // Handle successful modal completion
    // Could trigger user notifications, analytics, etc.
  }

  private handleModalDismissal(reason: any): void {
    // Handle modal dismissal (user cancelled)
    // Could save draft, show helpful messages, etc.
  }

  onSubmit() {
    this.formSubmission.emit();
  }

  private closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
