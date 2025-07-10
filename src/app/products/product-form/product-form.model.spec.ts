import { TestBed, inject } from '@angular/core/testing';
import { ProductForm } from './product-form.model'; // adjust path as needed
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormBuilder,
} from '@angular/forms';
import { PRODUCT_FORM_CONSTRAINTS } from './product-form-constants';
import { runInInjectionContext } from '@angular/core';

describe('ProductForm', () => {
  let productForm: ProductForm;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: NonNullableFormBuilder,
          useFactory: () => new FormBuilder().nonNullable,
        },
      ],
    });
    const fb = TestBed.inject(NonNullableFormBuilder);
    productForm = new ProductForm(fb);
  });

  it('should create the form with all fields', () => {
    expect(productForm.form.contains('name')).toBeTrue();
    expect(productForm.form.contains('description')).toBeTrue();
    expect(productForm.form.contains('price')).toBeTrue();
    expect(productForm.form.contains('quantity')).toBeTrue();
  });

  describe('Name Field Validation', () => {
    it('should invalidate empty name', () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue('');
      expect(productForm.invalidName).toBeTruthy();
    });

    it('should validate a proper name', () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue('a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength));
      // expect(productForm.invalidName).toBe;
    });

    it(`should show error for name longer than ${PRODUCT_FORM_CONSTRAINTS.nameMaxLength} characters`, () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue(
        'a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength + 1)
      );
      // expect(productForm.invalidName).false;
    });
  });

  it('should fail validation if price has too many decimals', () => {
    const priceControl = productForm.form.controls['price'];
    priceControl.markAsTouched();
    priceControl.setValue('99.999');
    // expect(productForm.invalidPrice).true;
  });

  it('should validate a correct price', () => {
    const priceControl = productForm.form.controls['price'];
    priceControl.markAsTouched();
    priceControl.setValue('99.99');
    // expect(productForm.invalidPrice).false;
  });
});
