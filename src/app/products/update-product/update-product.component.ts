import {
  Component,
  input,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductForm } from '../product-form.model';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit {
  productId = input.required<string>();
  private product!: Product;
  foundProduct: Product | undefined;
  writeFailed: boolean;
  modal = viewChild.required<TemplateRef<any>>('content');
  productForm = new ProductForm();

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.writeFailed = false;
  }

  ngOnInit() {
    console.log(`productId: ${this.productId}`);
    this.foundProduct = this.productService
      .products()
      .find((product) => this.productId() === product.id);

    if (!this.foundProduct) {
      console.error('could not get product for id ' + this.productId);
    } else {
      this.product = this.foundProduct;
      this.productForm.form.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity.toString(),
      });
    }
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.updateProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  updateProduct() {
    if (this.productForm.form.invalid) {
      return;
    }
    const newProduct: Product = {
      id: this.product.id,
      name: this.productForm.form.value['name']!,
      description: this.productForm.form.value['description']!,
      price: this.productForm.form.value.price!,
      quantity: parseInt(this.productForm.form.value.quantity!),
    };

    const subscription = this.productService
      .updateProduct(newProduct)
      .subscribe({
        next: (resp) => (this.writeFailed = false),
        error: (err) => {
          this.writeFailed = true;
          console.log(err);
        },
      });

    this.productService.closeConnection(subscription);

    if (this.writeFailed) {
      this.writeFailed = false;
    } else {
      this.modalService.dismissAll('save-click');
    }

    this.router.navigateByUrl('/');
  }
}
