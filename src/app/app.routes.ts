import { Routes } from '@angular/router';
import { NewProductComponent } from './products/product-form.model';

export const routes: Routes = [
  {
    path: 'new-product',
    component: NewProductComponent,
  },
  {
    path: 'update/:productId',
    loadComponent: () =>
      import('./products/update-product/update-product.component').then(
        (mod) => mod.UpdateProductComponent
      ),
  },
];
