import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AddApplicationComponent } from './components/add-application/add-application.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ApplicationDetailsComponent,
    ReportsComponent,
    AddApplicationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
