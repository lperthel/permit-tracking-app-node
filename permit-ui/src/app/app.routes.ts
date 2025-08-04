import { Routes } from '@angular/router';
import { NewProductComponent } from './products/new-product/new-product.component';

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
