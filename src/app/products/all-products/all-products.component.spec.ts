import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllProductsComponent } from './all-products.component';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '../../app.routes';
import { provideRouter } from '@angular/router';

describe('AllProductsComponent', () => {
  let component: AllProductsComponent;
  let fixture: ComponentFixture<AllProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllProductsComponent],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AllProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
