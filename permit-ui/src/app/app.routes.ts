import { Routes } from '@angular/router';
import { NewPermitComponent } from './permits/pages/new-permit/new-permit.component';

export const routes: Routes = [
  {
    path: 'new-permit',
    component: NewPermitComponent,
  },
  {
    path: 'update/:permitId',
    loadComponent: () =>
      import('./permits/pages/update-permit/update-permit.component').then(
        (mod) => mod.UpdatePermitComponent
      ),
  },
];
