import { Routes } from '@angular/router';
import { LoginPageComponent } from './iam/interfaces/pages/login-page/login-page.component';
import { RegisterPageComponent } from './iam/interfaces/pages/register-page/register-page.component';
import { ConfirmPageComponent } from './iam/interfaces/pages/confirm-page/confirm-page.component';
import { OverviewPageComponent } from './analytics/interfaces/pages/overview-page/overview-page.component';
import { SettingsPageComponent } from './iam/interfaces/pages/settings-page/settings-page.component';
import { AuthCallbackPageComponent } from './iam/interfaces/pages/auth-callback-page/auth-callback-page.component';
import { authGuard } from './iam/interfaces/guards/auth.guard';
import { AuthenticatedLayoutComponent } from './shared/interfaces/components/authenticated-layout/authenticated-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'confirm', component: ConfirmPageComponent },
  { path: 'auth/callback', component: AuthCallbackPageComponent },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewPageComponent },
      { path: 'home', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'plans', loadComponent: () => import('./billing/interfaces/pages/select-plan/select-plan.component').then(c => c.SelectPlanComponent) },
      { path: 'checkout', loadComponent: () => import('./billing/interfaces/pages/premium-checkout/premium-checkout.component').then(c => c.PremiumCheckoutComponent) },
      { path: 'space-devices', loadComponent: () => import('./device/interfaces/pages/space-devices-page/space-devices-page.component').then(c => c.SpaceDevicesPageComponent) },
      { path: 'analytics', loadComponent: () => import('./analytics/interfaces/pages/analytics-page/analytics-page.component').then(c => c.AnalyticsPageComponent) },
      { path: 'reports', loadComponent: () => import('./analytics/interfaces/pages/reports-page/reports-page.component').then(c => c.ReportsPageComponent) },
      { path: 'alerts', loadComponent: () => import('./alerting/interfaces/pages/alerts-page/alerts-page.component').then(c => c.AlertsPageComponent) },
      { path: 'select-plan', loadComponent: () => import('./billing/interfaces/pages/select-plan/select-plan.component').then(c => c.SelectPlanComponent) },
      { path: 'checkout-premium', loadComponent: () => import('./billing/interfaces/pages/premium-checkout/premium-checkout.component').then(c => c.PremiumCheckoutComponent) },
    ],
  },
];
