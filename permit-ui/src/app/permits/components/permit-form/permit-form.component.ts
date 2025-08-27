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
import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_SELECTORS,
} from '../../permit-form-model/permit-form.constants';
import { PermitForm } from '../../permit-form-model/permit-form.model';
import {
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_VALUES,
  PermitStatus,
} from '../../shared/models/permit-status.enums';

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

  public readonly DEFAULT_STATUS_PLACEHOLDER = 'Select a status...';

  // Add these properties
  protected readonly permitStatusValues = PERMIT_STATUS_VALUES;

  // Add this method to get display labels
  protected getStatusLabel(status: PermitStatus): string {
    return PERMIT_STATUS_LABELS[status];
  }

  errorMessages = PERMIT_FORM_ERRORS;
  permitForm = input.required<PermitForm>();
  formHeader = input.required<string>();
  isLoading = input<boolean>(false);

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
      },
    });

    // Handle modal dismissed (cancelled/escaped)
    const modalDismissed = modalRef.dismissed.subscribe({
      next: (reason) => {
        this.closeModalEvent.emit();
        this.permitForm().form.reset();
      },
    });
    // Register cleanup for all subscriptions
    this.closeConnection(modalClosed);
    this.closeConnection(modalDismissed);
  }

  dismissModal(reason: string) {
    this.modalService.dismissAll(reason);
  }

  onSubmit() {
    this.formSubmission.emit();
  }

  private closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
