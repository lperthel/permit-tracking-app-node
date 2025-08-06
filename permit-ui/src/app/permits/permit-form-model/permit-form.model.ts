import { Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { PERMIT_FORM_CONSTRAINTS } from './permit-form-constants';

@Injectable({
  providedIn: 'root', // or 'any' or declare in the component’s providers array
})
export class PermitForm {
  public form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<string>;
    quantity: FormControl<string>;
  }>;
  patterns = {
    price: '^[0-9]+(\\.[0-9]{1,2})?$',
    quantity: '^[0-9]{1,255}$',
  };
  constructor(private readonly fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_CONSTRAINTS.nameMaxLength),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_CONSTRAINTS.descMaxLength),
        ],
      ],
      price: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_CONSTRAINTS.priceMaxLength),
          Validators.pattern(this.patterns.price),
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.maxLength(PERMIT_FORM_CONSTRAINTS.quantityMax),
          Validators.pattern(this.patterns.quantity),
        ],
      ],
    });
  }

  get invalidName() {
    return this.form.controls.name.touched && this.form.controls.name.invalid;
  }

  get invalidDescription() {
    return (
      this.form.controls.description.touched &&
      this.form.controls.description.invalid
    );
  }

  get invalidPrice() {
    return this.form.controls.price.touched && this.form.controls.price.invalid;
  }

  get invalidQuanity() {
    return (
      this.form.controls.quantity.touched && this.form.controls.quantity.invalid
    );
  }
}
