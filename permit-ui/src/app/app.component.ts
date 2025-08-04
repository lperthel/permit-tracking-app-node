import { Component, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AllProductsComponent } from './products/all-products/all-products.component';

@Component({
  selector: 'app-root',
  imports: [AllProductsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'All Products';
}
