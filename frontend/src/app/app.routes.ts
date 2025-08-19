// app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AddApplicationComponent } from './components/add-application/add-application.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'application/:id', component: ApplicationDetailsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'add-application', component: AddApplicationComponent },
  { path: '**', redirectTo: '/dashboard' } // Wildcard route for 404s
];