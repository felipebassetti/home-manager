import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { HomePageComponent } from './pages/home/home.page';
import { HouseDetailPageComponent } from './pages/house-detail/house-detail.page';
import { HouseManagePageComponent } from './pages/house-manage/house-manage.page';
import { HousesPageComponent } from './pages/houses/houses.page';
import { PaymentsPageComponent } from './pages/payments/payments.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'houses', component: HousesPageComponent },
  { path: 'houses/:id', component: HouseDetailPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'house-manage', component: HouseManagePageComponent },
  { path: 'payments', component: PaymentsPageComponent },
  { path: '**', redirectTo: '' }
];
