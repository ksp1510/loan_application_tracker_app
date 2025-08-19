// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MaterialModule } from './shared/material.module';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterModule,
    MaterialModule,
    MatToolbarModule
  ]
})
export class AppComponent {
  title = 'Loan Management System';
}