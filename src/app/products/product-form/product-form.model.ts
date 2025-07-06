import { inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { PRODUCT_FORM_CONSTRAINTS } from './product-form-constants';

export class ProductForm {
  private fb = inject(NonNullableFormBuilder);

  patterns = {
    price: '^[0-9]{1,253}(\\.[0-9]{1,2})?$',
    quantity: '^[0-9]{1,255}$',
  };

  form = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(PRODUCT_FORM_CONSTRAINTS.nameMaxLength),
      ],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.maxLength(PRODUCT_FORM_CONSTRAINTS.descMaxLengith),
      ],
    ],
    price: [
      '',
      [
        Validators.required,
        Validators.maxLength(PRODUCT_FORM_CONSTRAINTS.priceMaxLength),
        Validators.pattern(this.patterns.price),
      ],
    ],
    quantity: [
      '',
      [
        Validators.required,
        Validators.maxLength(PRODUCT_FORM_CONSTRAINTS.quantityMax),
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
