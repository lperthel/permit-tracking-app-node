import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import {
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';

import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-product',
  imports: [ReactiveFormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');

  form = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    price: new FormControl(''),
    quantity: new FormControl(''),
  });

  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
          this.createProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  createProduct() {
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
    this.productService.closeConnection(sub);
  }
  onCancel() {
    this.router.navigateByUrl('/');
  }
}
