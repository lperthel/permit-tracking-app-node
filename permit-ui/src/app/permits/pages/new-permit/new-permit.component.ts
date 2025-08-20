// @ts-ignore - TODO: Fix during refactor
import {
  Component,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';
import { PermitFormComponent } from '../../components/permit-form/permit-form.component';
import {
  PERMIT_FORM_ERRORS,
  PERMIT_FORM_HEADERS,
} from '../../permit-form-model/permit-form.constants';
import { PermitForm } from '../../permit-form-model/permit-form.model';
import { PermitStatus } from '../../shared/models/permit-status.enums';
import { Permit } from '../../shared/models/permit.model';
import { PermitService } from '../../shared/services/permit.service';

@Component({
  selector: 'app-new-permit',
  imports: [ReactiveFormsModule, NgbAlertModule, PermitFormComponent],
  templateUrl: './new-permit.component.html',
  styleUrl: './new-permit.component.css',
})
export class NewPermitComponent implements OnInit {
  // String constants at top per coding guidelines
  private readonly EMPTY_STRING = '';
  private readonly SAVE_CLICK_DISMISS_REASON = 'save-click';
  private readonly HOME_ROUTE = '/';

  errorMessages = PERMIT_FORM_ERRORS;
  modalHeader = PERMIT_FORM_HEADERS.newPermit;
  isSubmitting = signal<boolean>(false);

  constructor(
    private readonly permitService: PermitService,
    private readonly router: Router,
    public permitForm: PermitForm
  ) {}

  permitFormComponent =
    viewChild.required<PermitFormComponent>('permitFormElement');
  closeResult: WritableSignal<string> = signal(this.EMPTY_STRING);

  ngOnInit(): void {
    this.permitFormComponent().openModal();
  }

  createPermit() {
    // start spinner
    this.permitForm.form.markAllAsTouched();

    const rawName = this.permitForm.form.value.permitName!;
    DOMPurify.sanitize(rawName);
    const rawDescription =
      this.permitForm.form.value.applicantName ?? this.EMPTY_STRING;
    DOMPurify.sanitize(rawDescription);

    if (this.permitForm.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    const permit: Permit = {
      id: uuidv4(),
      permitName: this.permitForm.form.value.permitName!,
      applicantName: this.permitForm.form.value.applicantName!,
      permitType: this.permitForm.form.value.permitType!,
      status: this.permitForm.form.value.status! as PermitStatus,
    };

    const sub = this.permitService.createPermit(permit).subscribe({
      next: (_resp) => {
        this.isSubmitting.set(false);
        this.permitFormComponent().restError.set(this.EMPTY_STRING);
        this.permitFormComponent().dismissModal(this.SAVE_CLICK_DISMISS_REASON);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.permitFormComponent().restError.set(err.message);
      },
    });
    this.permitService.closeConnection(sub);
  }

  onCancel() {
    this.router.navigateByUrl(this.HOME_ROUTE);
  }

  handleFormSubmission() {
    this.createPermit();
  }

  handleCloseModal() {
    this.router.navigateByUrl(this.HOME_ROUTE);
  }
}
