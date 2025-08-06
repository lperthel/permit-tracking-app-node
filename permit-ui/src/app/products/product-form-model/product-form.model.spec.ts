import { TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { PRODUCT_FORM_CONSTRAINTS } from './product-form-constants';
import { ProductForm } from './product-form.model'; // adjust path as needed

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
      expect(productForm.invalidName).toBeTrue();
    });

    it('should validate a proper name', () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue('a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength));
      expect(productForm.invalidName).toBeFalse();
    });

    it(`should show error for name longer than ${PRODUCT_FORM_CONSTRAINTS.nameMaxLength} characters`, () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue(
        'a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength + 1)
      );
      expect(productForm.invalidName).toBeTrue();
    });
  });

  describe('Description Field Validation', () => {
    it('should validate a correct description', () => {
      const descControl = productForm.form.controls['description'];
      descControl.markAsTouched();
      descControl.setValue('a'.repeat(PRODUCT_FORM_CONSTRAINTS.descMaxLength));
      expect(productForm.invalidName).toBeFalse();
    });
  });
  describe('Price Field Validation', () => {
    it('should fail validation if price has too many decimals', () => {
      const priceControl = productForm.form.controls['price'];
      priceControl.markAsTouched();
      priceControl.setValue('99.999');
      expect(productForm.invalidPrice).toBeTrue();
    });

    it('should validate a correct price', () => {
      const priceControl = productForm.form.controls['price'];
      priceControl.markAsTouched();
      priceControl.setValue('99.99');
      expect(productForm.invalidPrice).toBeFalse();
      priceControl.setValue('99.9');
      expect(productForm.invalidPrice).toBeFalse();
      priceControl.setValue(
        '1'.repeat(PRODUCT_FORM_CONSTRAINTS.priceMaxLength)
      );
      priceControl.setValue('1'.repeat(3));
      expect(productForm.invalidPrice).toBeFalse();
    });

    it('should fail validation for a malformed price', () => {
      const priceControl = productForm.form.controls['price'];
      priceControl.markAsTouched();
      priceControl.setValue('99.');
      expect(productForm.invalidPrice).toBeTrue();
      priceControl.setValue('a');
      expect(productForm.invalidPrice).toBeTrue();
    });
    it('should fail validation for invalid price length', () => {
      const priceControl = productForm.form.controls['price'];
      priceControl.markAsTouched();
      priceControl.setValue(
        '1'.repeat(PRODUCT_FORM_CONSTRAINTS.priceMaxLength + 1)
      );
      expect(productForm.invalidPrice).toBeTrue();
    });
  });

  describe('Quantity Field Validation', () => {
    it('should validate a correct quantity', () => {
      const quantityControl = productForm.form.controls['quantity'];
      quantityControl.markAsTouched();
      quantityControl.setValue(
        '1'.repeat(PRODUCT_FORM_CONSTRAINTS.quantityMax)
      );
      expect(productForm.invalidQuanity).toBeFalse();
    });

    it('should fail validation for a malformed quantity', () => {
      const quantityControl = productForm.form.controls['quantity'];
      quantityControl.markAsTouched();
      quantityControl.setValue('99.');
      expect(productForm.invalidQuanity).toBeTrue();
      quantityControl.setValue('a');
      expect(productForm.invalidQuanity).toBeTrue();
      quantityControl.setValue('-1');
      expect(productForm.invalidQuanity).toBeTrue();
    });
    it('should fail validation for invalid quantity length', () => {
      const quantityControl = productForm.form.controls['quantity'];
      quantityControl.markAsTouched();
      quantityControl.setValue(
        '1'.repeat(PRODUCT_FORM_CONSTRAINTS.quantityMax + 1)
      );
      expect(productForm.invalidQuanity).toBeTrue();
    });
  });
});
