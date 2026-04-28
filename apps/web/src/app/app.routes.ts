import { Routes } from '@angular/router';
import { guestOnlyGuard, requireAuthGuard, requireManagementGuard } from './auth.guards';
import { ApplicationsPageComponent } from './pages/applications/applications.page';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { HomePageComponent } from './pages/home/home.page';
import { HouseDetailPageComponent } from './pages/house-detail/house-detail.page';
import { HouseManagePageComponent } from './pages/house-manage/house-manage.page';
import { HousesPageComponent } from './pages/houses/houses.page';
import { LoginPageComponent } from './pages/login/login.page';
import { MyHousesPageComponent } from './pages/my-houses/my-houses.page';
import { PaymentsPageComponent } from './pages/payments/payments.page';
import { PlatformMetricsPageComponent } from './pages/platform-metrics/platform-metrics.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent, canActivate: [guestOnlyGuard] },
  { path: 'houses', component: HousesPageComponent },
  { path: 'houses/:id', component: HouseDetailPageComponent },
  { path: 'applications', component: ApplicationsPageComponent, canActivate: [requireAuthGuard] },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [requireManagementGuard] },
  { path: 'my-houses', component: MyHousesPageComponent, canActivate: [requireManagementGuard] },
  { path: 'admin', component: PlatformMetricsPageComponent, canActivate: [requireManagementGuard] },
  { path: 'house-manage', component: HouseManagePageComponent, canActivate: [requireManagementGuard] },
  { path: 'payments', component: PaymentsPageComponent, canActivate: [requireManagementGuard] },
  { path: '**', redirectTo: '' }
];
