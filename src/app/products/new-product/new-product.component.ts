import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent {
  private productService = inject(ProductService);
  private router = inject(Router);
  // form? = viewChild<NgForm>('updateForm');

  form = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    price: new FormControl(''),
    quantity: new FormControl(''),
  });

  constructor() {}

  onSubmit() {
    console.log('form submitted');
    const product: Product = {
      id: UUID.UUID(),
      name: this.form.value.name || '',
      description: this.form.value.description || '',
      price: this.form.value.price || '',
      quantity: parseInt(this.form.value.quantity || '0', 10),
    };
    const sub = this.productService.createProduct(product).subscribe({
      next: (val) => console.log(val),
    });
  }
  onCancel() {
    this.router.navigateByUrl('/');
  }
}
