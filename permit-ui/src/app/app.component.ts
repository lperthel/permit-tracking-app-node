import { Component } from '@angular/core';
import { AllPermitsComponent } from './permits/pages/all-permits/all-permits.component';

@Component({
  selector: 'app-root',
  imports: [AllPermitsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'All Permits';
}
