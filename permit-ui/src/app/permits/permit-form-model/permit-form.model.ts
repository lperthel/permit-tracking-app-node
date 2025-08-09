import { Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  PERMIT_FORM_MAX_LENGTHS,
  PERMIT_FORM_PATTERNS,
} from './permit-form-constants';

@Injectable({
  providedIn: 'root',
})
export class PermitForm {
  public form: FormGroup<{
    permitName: FormControl<string>;
    applicantName: FormControl<string>;
    permitType: FormControl<string>;
    status: FormControl<string>;
  }>;

  constructor(private readonly fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      permitName: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_MAX_LENGTHS.PERMIT_NAME),
          Validators.pattern(PERMIT_FORM_PATTERNS.PERMIT_NAME),
        ],
      ],
      applicantName: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_MAX_LENGTHS.APPLICANT_NAME),
          Validators.pattern(PERMIT_FORM_PATTERNS.APPLICANT_NAME),
        ],
      ],
      permitType: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_MAX_LENGTHS.PERMIT_TYPE),
          Validators.pattern(PERMIT_FORM_PATTERNS.PERMIT_TYPE),
        ],
      ],
      status: [
        '',
        [
          Validators.required,
          // Note: For now treating status as string input
          // TODO: Convert to dropdown with PermitStatus enum values
        ],
      ],
    });
  }

  get invalidPermitName() {
    return (
      this.form.controls.permitName.touched &&
      this.form.controls.permitName.invalid
    );
  }

  get invalidApplicantName() {
    return (
      this.form.controls.applicantName.touched &&
      this.form.controls.applicantName.invalid
    );
  }

  get invalidPermitType() {
    return (
      this.form.controls.permitType.touched &&
      this.form.controls.permitType.invalid
    );
  }

  get invalidStatus() {
    return (
      this.form.controls.status.touched && this.form.controls.status.invalid
    );
  }
}
