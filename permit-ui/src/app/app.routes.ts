import { Routes } from '@angular/router';
import { NewPermitComponent } from './permits/pages/new-permit/new-permit.component';

export const ROUTE_CONSTANTS = {
  NEW_PERMIT_PATH: 'new-permit',
  GENERATE_UPDATE_URL: (id: string) => `update/${id}`,
  UPDATE_PERMIT_URL: 'update/:permitId',
  ROOT_PAGE: '/',
} as const;

export const routes: Routes = [
  {
    path: ROUTE_CONSTANTS.NEW_PERMIT_PATH,
    component: NewPermitComponent,
  },
  {
    path: ROUTE_CONSTANTS.UPDATE_PERMIT_URL,
    loadComponent: () =>
      import('./permits/pages/update-permit/update-permit.component').then(
        (mod) => mod.UpdatePermitComponent
      ),
  },
];
