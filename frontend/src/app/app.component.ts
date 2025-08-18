//app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './shared/material.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddApplicationComponent } from './components/add-application/add-application.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { ReportsComponent } from './components/reports/reports.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, MaterialModule, DashboardComponent, AddApplicationComponent, ApplicationDetailsComponent, ReportsComponent],
    
})



export class AppComponent {
  title = 'frontend';
  

}



