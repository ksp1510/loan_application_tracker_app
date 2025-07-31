import { Component } from '@angular/core';
import { ApplicationService } from '../../services/application.service';
import { JsonPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgIf, JsonPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  report: any;

  constructor(private applicationService: ApplicationService) {}

  generateReport() {
    this.applicationService.generateReport().subscribe(
      (data) => {
        this.report = data;
      },
      (error) => {
        console.error('Error generating report', error);
      }
    );
  }
}

