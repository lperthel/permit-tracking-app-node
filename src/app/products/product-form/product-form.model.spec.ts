import { TestBed, inject } from '@angular/core/testing';
import { ProductForm } from './product-form.model'; // adjust path as needed
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { PRODUCT_FORM_CONSTRAINTS } from './product-form-constants';

describe('ProductForm', () => {
  let productForm: ProductForm;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [NonNullableFormBuilder],
    });

    productForm = new ProductForm(); // `inject()` works because TestBed is initialized
  });

  it('should create the form with all fields', () => {
    expect(productForm.form.contains('name')).true;
    expect(productForm.form.contains('description')).true;
    expect(productForm.form.contains('price')).true;
    expect(productForm.form.contains('quantity')).true;
  });

  describe('Name Field Validation', () => {
    it('should invalidate empty name', () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue('');
      expect(productForm.invalidName).true;
    });

    it('should validate a proper name', () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue('a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength));
      expect(productForm.invalidName).false;
    });

    it(`should show error for name longer than ${PRODUCT_FORM_CONSTRAINTS.nameMaxLength} characters`, () => {
      const nameControl = productForm.form.controls['name'];
      nameControl.markAsTouched();
      nameControl.setValue(
        'a'.repeat(PRODUCT_FORM_CONSTRAINTS.nameMaxLength + 1)
      );
      expect(productForm.invalidName).false;
    });
  });

  it('should fail validation if price has too many decimals', () => {
    const priceControl = productForm.form.controls['price'];
    priceControl.markAsTouched();
    priceControl.setValue('99.999');
    expect(productForm.invalidPrice).true;
  });

  it('should validate a correct price', () => {
    const priceControl = productForm.form.controls['price'];
    priceControl.markAsTouched();
    priceControl.setValue('99.99');
    expect(productForm.invalidPrice).false;
  });

  // Add more tests as needed...
});
