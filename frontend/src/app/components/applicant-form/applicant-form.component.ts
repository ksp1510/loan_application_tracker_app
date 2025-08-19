// components/applicant-form/applicant-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-applicant-form',
  templateUrl: './applicant-form.component.html',
  styleUrls: ['./applicant-form.component.css'],
  standalone: true,
  imports: [MaterialModule]
})
export class ApplicantFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  maritalStatusOptions = [
    'Single', 'Married', 'Common-law', 'Divorced', 'Separated', 'Widowed'
  ];

  statusInCanadaOptions = [
    'Canadian Citizen', 'Permanent Resident', 'Work Permit', 'Student Permit', 'Visitor'
  ];

  constructor() { }

  ngOnInit(): void {
    if (!this.formGroup) {
      console.error('FormGroup is required for ApplicantFormComponent');
    }
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.formGroup.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldPath: string): string {
    const field = this.formGroup.get(fieldPath);
    if (field?.errors) {
      const errors = field.errors;
      if (errors['required']) return 'This field is required';
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['pattern']) return 'Please enter a valid format';
      if (errors['invalidPostalCode']) return 'Please enter a valid Canadian postal code';
      if (errors['invalidPhone']) return 'Please enter a valid Canadian phone number';
    }
    return '';
  }
}