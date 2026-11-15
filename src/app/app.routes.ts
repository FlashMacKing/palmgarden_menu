import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
  { path: '', component: MenuComponent, title: 'The Palm Garden — La carte' },
  {
    path: 'qr',
    loadComponent: () => import('./qr/qr.component').then((m) => m.QrComponent),
    title: 'The Palm Garden — QR code',
  },
  { path: '**', redirectTo: '' },
];
