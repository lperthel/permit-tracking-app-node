import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiServer = 'http://localhost:3000';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  products = signal<Product[]>([]);

  constructor(private httpClient: HttpClient, private destroyRef: DestroyRef) {}

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(
      this.apiServer + '/products/',
      JSON.stringify(product),
      this.httpOptions
    );
  }

  get requestAllProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      this.apiServer + '/products/',
      this.httpOptions
    );
  }

  requestProduct(productId: string): Observable<Product> {
    return this.httpClient.get<Product>(
      this.apiServer + '/products/' + productId,
      this.httpOptions
    );
  }

  deletProduct(productId: string): Observable<string> {
    return this.httpClient.delete<string>(
      this.apiServer + '/products/' + productId,
      this.httpOptions
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.put<Product>(
      this.apiServer + '/products/' + product.id,
      product,
      this.httpOptions
    );
  }

  closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
