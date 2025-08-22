// @ts-ignore - TODO: Fix during refactor
import { Component, input, OnInit, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'app-update-permit',
  imports: [ReactiveFormsModule, NgbAlertModule, PermitFormComponent],
  templateUrl: './update-permit.component.html',
  styleUrl: './update-permit.component.css',
})
export class UpdatePermitComponent implements OnInit {
  errorMessages = PERMIT_FORM_ERRORS;
  modalHeader = PERMIT_FORM_HEADERS.updatePermit;
  permitId = input.required<string>();
  isSubmitting = signal<boolean>(false);
  private permit!: Permit;
  foundPermit: Permit | undefined;

  permitFormComponent =
    viewChild.required<PermitFormComponent>('permitFormElement');

  constructor(
    private readonly permitService: PermitService,
    private readonly router: Router,
    public permitForm: PermitForm
  ) {}

  ngOnInit() {
    this.foundPermit = this.permitService
      .permits()
      .find((permit) => this.permitId() === permit.id);

    if (!this.foundPermit) {
      console.error('could not get permit for id ' + this.permitId);
    } else {
      this.permit = this.foundPermit;
      this.permitForm.form.reset();
      this.permitForm.form.patchValue({
        permitName: this.permit.permitName,
        applicantName: this.permit.applicantName,
        permitType: this.permit.permitType,
        status: this.permit.status,
      });
    }
    this.permitFormComponent().openModal();
  }

  updatePermit() {
    this.isSubmitting.set(true);

    if (this.permitForm.form.invalid) {
      this.isSubmitting.set(false);
      return;
    }
    const updatePermit: Permit = {
      id: this.permit.id,
      permitName: this.permitForm.form.value.permitName!,
      applicantName: this.permitForm.form.value.applicantName!,
      permitType: this.permitForm.form.value.permitType!,
      status: this.permitForm.form.value.status! as PermitStatus,
    };

    const subscription = this.permitService
      .updatePermit(updatePermit)
      .subscribe({
        next: (_resp) => {
          this.isSubmitting.set(false);
          this.permitFormComponent().restError.set('');
          this.permitFormComponent().dismissModal('save-click');

          this.router.navigateByUrl('/');
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.permitFormComponent().restError.set(err.message);
        },
      });

    this.permitService.closeConnection(subscription);
  }

  handleFormSubmission() {
    this.updatePermit();
  }
  handleCloseModal() {
    this.router.navigateByUrl('/');
  }
}
