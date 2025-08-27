import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { PermitStatus } from '../shared/models/permit-status.enums';
import {
  PERMIT_FORM_CONSTRAINTS,
  PERMIT_FORM_PATTERNS,
} from './permit-form.constants';

@Injectable({
  providedIn: 'root',
})
export class PermitForm {
  // String constants at top per coding guidelines
  private readonly EMPTY_STRING = '';

  private readonly PERMIT_STATUS_PATTERN = new RegExp(
    `^(${Object.values(PermitStatus).join('|')})$`
  );
  public form: FormGroup<{
    permitName: FormControl<string>;
    applicantName: FormControl<string>;
    permitType: FormControl<string>;
    status: FormControl<PermitStatus | ''>;
  }>;

  static cannotBeOnlyWhitespace(
    control: AbstractControl
  ): ValidationErrors | null {
    if (control.value.match(/^\s+$/)) {
      return { cannotBeOnlyWhitespace: true };
    }

    return null;
  }

  constructor(private readonly fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      permitName: this.fb.control(this.EMPTY_STRING, [
        Validators.required,
        Validators.maxLength(PERMIT_FORM_CONSTRAINTS.permitNameMaxLength),
        Validators.pattern(PERMIT_FORM_PATTERNS.VALID_CHARS),
        PermitForm.cannotBeOnlyWhitespace,
      ]),
      applicantName: this.fb.control(this.EMPTY_STRING, [
        Validators.required,
        Validators.maxLength(PERMIT_FORM_CONSTRAINTS.applicantNameMaxLength),
        Validators.pattern(PERMIT_FORM_PATTERNS.VALID_CHARS),
        PermitForm.cannotBeOnlyWhitespace,
      ]),
      permitType: this.fb.control(this.EMPTY_STRING, [
        Validators.required,
        Validators.maxLength(PERMIT_FORM_CONSTRAINTS.permitTypeMaxLength),
        Validators.pattern(PERMIT_FORM_PATTERNS.VALID_CHARS),
        PermitForm.cannotBeOnlyWhitespace,
      ]),
      status: this.fb.control(this.EMPTY_STRING as PermitStatus | '', [
        Validators.required,
        Validators.pattern(this.PERMIT_STATUS_PATTERN),
      ]),
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
