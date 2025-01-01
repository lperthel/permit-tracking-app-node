import { inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';

export class ProductForm {
  private fb = inject(NonNullableFormBuilder);

  patterns = {
    price: '^[0-9]{1,253}(\\.[0-9]{1,2})?$',
    quantity: '^[0-9]{1,255}$',
  };

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.required, Validators.maxLength(255)],
    price: [
      '',
      [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(this.patterns.price),
      ],
    ],
    quantity: [
      '',
      [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(this.patterns.quantity),
      ],
    ],
  });

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
