import { inject, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NewProductComponent } from './new-product.component'; // Update the path as needed
import { ProductService } from '../product/product.service'; // Update the path as needed
import { of, throwError } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import { Product } from '../product/product.model';

describe('NewProductComponent', () => {
  let component: NewProductComponent;
  let mockProductService: { createProduct: jasmine.Spy<jasmine.Func> };
  let router: Router;
  let httpTestingController!: HttpTestingController;
  let mockModalService: { dismissAll: jasmine.Spy };
  let mockRouter: { navigate: jasmine.Spy };

  beforeEach(() => {
    mockModalService = { dismissAll: jasmine.createSpy('dismissAll') }; //mock function dismissAll
    mockRouter = { navigate: jasmine.createSpy('navigateByUrl') };
    const mockProductService = ;
    //inject Mocks
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NewProductComponent,
        ProductService,
        { provide: 'ModalService', useValue: mockModalService }, // Mock ModalService
        { provide: 'Router', useValue: mockRouter }, //Mock router
      ],
    });

    component = TestBed.inject(NewProductComponent);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no outstanding HTTP requests
  });

  it('should handle errors correctly in subscribe', () => {
    const mockProduct = {
      id: UUID.UUID(),
      name: 'Test Product',
      description: 'Description',
      price: '10.99',
      quantity: 5,
    };

    // Spy on productService.createProduct to simulate an error
    // spyOn(mockProductService, 'createProduct').and.returnValue(
    //   throwError(() => new Error('Simulated network error'))
    // );

    // Call the component's createProduct method
    component.createProduct();

    // Assert that the modalService.dismissAll was NOT called
    expect(mockModalService.dismissAll).not.toHaveBeenCalled();
    expect(component.restError() === 'Simulated network error');
    // Optionally, you can add expectations for logging or error handling (if any)
  });
});
