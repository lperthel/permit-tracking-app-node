import { ProductService } from './product.service';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Product } from '../product/product.model'; // Adjust the path as needed
import { UUID } from 'angular2-uuid';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { PRODUCTS } from '../../../../server/test-db-data';

describe('ProductService', () => {
  const apiServer = 'http://localhost:3000';
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  let service: ProductService, httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure there are no outstanding HTTP requests
  });

  it('should get all products', () => {
    service.requestAllProducts.subscribe({
      next: (products) => {
        console.log(products);
        expect(products).toBeTruthy('No products returned.');
        expect(products.length).toBe(3, 'incorrect nubmer of products');
        const product = products.find((product) => product.uuid === '1');
        expect(product?.name === 'Refined Concrete Chair');
      },
    });
    const req = httpTestingController.expectOne(
      `${service.apiServer}/products/`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(PRODUCTS);
  });

  it('should create a product successfully', () => {
    const mockProduct: Product = {
      id: UUID.UUID(),
      name: 'Test Product',
      description: 'Description',
      price: '10.99',
      quantity: 5,
    };

    service.createProduct(mockProduct).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne(
      `${service.apiServer}/products/`
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockProduct); // Simulate a successful response
  });

  it('should handle REST errors correctly', () => {
    service.products.set([PRODUCTS[0], PRODUCTS[1]]);
    const backupProducts = service.products(); // Save current state for testing rollback
    service.createProduct(PRODUCTS[2]).subscribe({
      next: (val) => fail('the create product call should have failed'),
      error: (error) => {
        expect(service.products()).toEqual(backupProducts); // Ensure rollback occurred
        expect(error.message).toContain(
          'REST call to create new product failed.'
        );
      },
    });

    const req = httpTestingController.expectOne(
      `${service.apiServer}/products/`
    );
    expect(req.request.body).toEqual(JSON.stringify(PRODUCTS[2]));
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    expect(req.request.method).toBe('POST');

    req.flush('Create Product Failed', {
      status: 500,
      statusText: 'Internal ServiceError',
    });
  });
});
