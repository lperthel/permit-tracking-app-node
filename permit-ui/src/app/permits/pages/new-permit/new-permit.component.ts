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
} from '../../permit-form-model/permit-form-constants';
import { PermitForm } from '../../permit-form-model/permit-form.model';
import { Permit } from '../../shared/models/permit.model';
import { PermitService } from '../../shared/services/permit.service';

@Component({
  selector: 'app-new-permit',
  imports: [ReactiveFormsModule, NgbAlertModule, PermitFormComponent],
  templateUrl: './new-permit.component.html',
  styleUrl: './new-permit.component.css',
})
export class NewPermitComponent implements OnInit {
  errorMessages = PERMIT_FORM_ERRORS;
  modalHeader = PERMIT_FORM_HEADERS.newPermit;

  constructor(
    private readonly createPermitService: PermitService,
    private readonly router: Router,
    public permitForm: PermitForm
  ) {}

  permitFormComponent =
    viewChild.required<PermitFormComponent>('permitFormElement');
  closeResult: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.permitFormComponent().openModal();
  }

  createPermit() {
    this.permitForm.form.markAllAsTouched();

    const rawName = this.permitForm.form.value.name!;
    DOMPurify.sanitize(rawName);
    const rawDescription = this.permitForm.form.value.description ?? '';
    DOMPurify.sanitize(rawDescription);

    if (this.permitForm.form.invalid) {
      return;
    }

    if (this.permitForm.form.value.price?.indexOf('.') == -1) {
      this.permitForm.form.value.price.concat('.00');
    }

    const permit: Permit = {
      id: uuidv4(),
      permitName: this.permitForm.form.value.name!,
      applicantName: this.permitForm.form.value.description!,
      permitType: this.permitForm.form.value.price!,
      status: this.permitForm.form.value.quantity!,
    };

    const sub = this.createPermitService.createPermit(permit).subscribe({
      next: (_resp) => {
        this.permitFormComponent().restError.set('');
        this.permitFormComponent().dismissModal('save-click');
      },
      error: (err: Error) => {
        this.permitFormComponent().restError.set(err.message);
      },
    });
    this.createPermitService.closeConnection(sub);
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }

  handleFormSubmission() {
    this.createPermit();
  }
  handleCloseModal() {
    this.router.navigateByUrl('/');
  }
}
