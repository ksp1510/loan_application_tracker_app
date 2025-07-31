import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-add-application',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css'
})
export class AddApplicationComponent {
  application = {
    applicantName: '',
    loanAmount: null
  };

  constructor(private applicationService: ApplicationService, private router: Router) {}

  addApplication() {
    this.applicationService.addApplication(this.application).subscribe(
      (data) => {
        alert('Application added successfully');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error adding application', error);
        alert('Failed to add application');
      }
    );
  }
}
