import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/application.service';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [RouterModule, NgFor, FormsModule]
})
export class DashboardComponent implements OnInit {
  applications: any[] = [];

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.getAllApplications().subscribe(
      (data) => {
        this.applications = data;
      },
      (error) => {
        console.error('Error fetching applications', error);
      }
    );
  }

  saveChanges(application: any): void {
    const updatedData = {
      approved_amount: application.approved_amount,
      status: application.status
    };

    this.applicationService.updateApplication(application.application_number, updatedData).subscribe(
      (response) => {
        console.log('Application updated successfully', response);
        alert('Changes saved successfully!');
      },
      (error) => {
        console.error('Error updating application', error);
        alert('Failed to save changes.');
      }
    );
  }
}
