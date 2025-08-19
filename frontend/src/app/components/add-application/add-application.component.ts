import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { ApplicationService } from '../../services/application.service';
import { ApplicantFormComponent } from '../applicant-form/applicant-form.component';

// Custom Validators
function canadianPostalCodeValidator(control: AbstractControl) {
  const postalCodePattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  if (control.value && !postalCodePattern.test(control.value)) {
    return { invalidPostalCode: true };
  }
  return null;
}

function canadianPhoneValidator(control: AbstractControl) {
  const phonePattern = /^(\+1[-.\s]?)?(\()?[0-9]{3}(\))?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  if (control.value && !phonePattern.test(control.value)) {
    return { invalidPhone: true };
  }
  return null;
}

@Component({
  standalone: true,
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.css'],
  imports: [
    MaterialModule,
    ApplicantFormComponent
  ]
})
export class AddApplicationComponent implements OnInit {
  applicationForm!: FormGroup;
  isSubmitting = false;
  showCoApplicant = false;
  
  // Dropdown options
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
  
  securityOptions = [
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Property', label: 'Property' }, 
    { value: 'Co-Signer', label: 'Co-Signer' },
    { value: 'N/A', label: 'None' }
  ];

  applicationStatuses = [
    { value: 'APPLIED', label: 'Applied' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'FUNDED', label: 'Funded' },
    { value: 'DECLINED', label: 'Declined' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.applicationForm = this.fb.group({
      // Application Overview
      amount: ['', [Validators.required, Validators.min(100)]],
      security: ['', Validators.required],
      status: ['APPLIED', Validators.required],
      notes: [''],
      reason: [''],
      
      // Main Applicant
      main_applicant: this.createApplicantFormGroup(),
      
      // Co-Applicant (optional)
      co_applicant: this.createApplicantFormGroup(),
      hasCoApplicant: [false],

      // Income and expenses (moved to main level)
      ft_income: [0, [Validators.min(0)]],
      pt_income: [0, [Validators.min(0)]],
      child_tax: [0, [Validators.min(0)]],
      govt_support: [0, [Validators.min(0)]],
      pension: [0, [Validators.min(0)]],
      utilities: [0, [Validators.min(0)]],
      property_taxes: [0, [Validators.min(0)]],
      child_support: [0, [Validators.min(0)]],
      groceries: [0, [Validators.min(0)]],
      car_insurence: [0, [Validators.min(0)]],
      car_payment: [0, [Validators.min(0)]],
      phone_bill: [0, [Validators.min(0)]],
      internet: [0, [Validators.min(0)]],
      
      // Existing Loans
      loan: this.fb.array([])
    });

    // Watch co-applicant toggle
    this.applicationForm.get('hasCoApplicant')?.valueChanges.subscribe(hasCoApplicant => {
      this.showCoApplicant = hasCoApplicant;
      const coApplicantGroup = this.applicationForm.get('co_applicant');
      
      if (hasCoApplicant) {
        this.setValidatorsForApplicant(coApplicantGroup as FormGroup, true);
      } else {
        this.clearValidatorsForApplicant(coApplicantGroup as FormGroup);
        coApplicantGroup?.reset();
      }
    });
  }

  private createApplicantFormGroup(): FormGroup {
    return this.fb.group({
      // Personal Information
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      SIN: ['', [Validators.required, Validators.pattern(/^\d{3}[-\s]?\d{3}[-\s]?\d{3}$/)]],
      email: ['', [Validators.required, Validators.email]],
      cell_phone: ['', [Validators.required, canadianPhoneValidator]],
      marital_status: ['', Validators.required],
      dependents: [0, [Validators.min(0), Validators.max(20)]],
      status_in_canada: ['', Validators.required],
      
      // Address
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        postal_code: ['', [Validators.required, canadianPostalCodeValidator]]
      }),
      rent: [0, [Validators.required, Validators.min(0)]],
      duration_at_address: [0, [Validators.required, Validators.min(0)]],
      
      // Employment
      ft_employment: this.fb.group({
        company_name: [''],
        position: [''],
        length_of_service: [0, Validators.min(0)],
        gross_income: [0, Validators.min(0)],
        company_address: this.fb.group({
          street: [''],
          city: [''],
          province: [''],
          postal_code: ['', canadianPostalCodeValidator]
        }),
        company_phone: ['', canadianPhoneValidator]
      }),
      
      // Vehicles
      vehicle1: this.fb.group({
        year: ['', [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
        make: [''],
        model: ['']
      }),
      vehicle2: this.fb.group({
        year: ['', [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
        make: [''],
        model: ['']
      })
    });
  }

  private setValidatorsForApplicant(applicantGroup: FormGroup, required: boolean): void {
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'SIN', 'email', 'cell_phone', 'marital_status', 'status_in_canada'];
    
    requiredFields.forEach(field => {
      const control = applicantGroup.get(field);
      if (control) {
        if (required) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
    });

    // Address validators
    const addressGroup = applicantGroup.get('address') as FormGroup;
    if (addressGroup) {
      const addressFields = ['street', 'city', 'province', 'postal_code'];
      addressFields.forEach(field => {
        const control = addressGroup.get(field);
        if (control) {
          if (required) {
            if (field === 'postal_code') {
              control.setValidators([Validators.required, canadianPostalCodeValidator]);
            } else {
              control.setValidators([Validators.required]);
            }
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity();
        }
      });
    }
  }

  private clearValidatorsForApplicant(applicantGroup: FormGroup): void {
    Object.keys(applicantGroup.controls).forEach(key => {
      const control = applicantGroup.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          const subControl = control.get(subKey);
          subControl?.clearValidators();
          subControl?.updateValueAndValidity();
        });
      } else {
        control?.clearValidators();
        control?.updateValueAndValidity();
      }
    });
  }

  // Loan array management
  get mainApplicantLoans(): FormArray {
    return this.applicationForm.get('loan') as FormArray;
  }

  addLoan(applicantType: 'main'): void {
    const loanGroup = this.fb.group({
      financial_institution: ['', Validators.required],
      monthly_pymnt: [0, [Validators.required, Validators.min(1)]]
    });

    this.mainApplicantLoans.push(loanGroup);
  }

  removeLoan(index: number): void {
    this.mainApplicantLoans.removeAt(index);
  }

  // Financial calculations
  getTotalIncome(applicantType: 'main'): number {
    const form = this.applicationForm.value;
    return (form.ft_income || 0) + 
           (form.pt_income || 0) + 
           (form.child_tax || 0) + 
           (form.govt_support || 0) + 
           (form.pension || 0);
  }

  getTotalExpenses(applicantType: 'main'): number {
    const form = this.applicationForm.value;
    return (form.utilities || 0) + 
           (form.property_taxes || 0) + 
           (form.child_support || 0) + 
           (form.groceries || 0) + 
           (form.car_insurence || 0) + 
           (form.car_payment || 0) + 
           (form.phone_bill || 0) + 
           (form.internet || 0);
  }

  getNetIncome(applicantType: 'main'): number {
    return this.getTotalIncome(applicantType) - this.getTotalExpenses(applicantType);
  }

  // Form submission
  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.snackBar.open('Please fix all validation errors before submitting', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;
    
    // Prepare data for submission
    const formData = { ...this.applicationForm.value };
    
    // Remove co_applicant if not needed
    if (!formData.hasCoApplicant) {
      delete formData.co_applicant;
    }
    delete formData.hasCoApplicant;

    // Clean up empty loans
    if (!formData.loan || formData.loan.length === 0) {
      delete formData.loan;
    }

    this.applicationService.createApplication(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snackBar.open('Application created successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to application details
        this.router.navigate(['/application', response.id]);
      },
      error: (error) => {
        console.error('Error creating application:', error);
        this.isSubmitting = false;
        this.snackBar.open('Failed to create application. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Utility methods
  isFieldInvalid(fieldPath: string): boolean {
    const field = this.applicationForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldPath: string): string {
    const field = this.applicationForm.get(fieldPath);
    if (field?.errors) {
      const errors = field.errors;
      if (errors['required']) return 'This field is required';
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['pattern']) return 'Please enter a valid format';
      if (errors['invalidPostalCode']) return 'Please enter a valid Canadian postal code (e.g., K1A 0A6)';
      if (errors['invalidPhone']) return 'Please enter a valid Canadian phone number';
    }
    return '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  // Cancel and navigation
  cancel(): void {
    if (this.applicationForm.dirty) {
      if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Save as draft (future feature)
  saveAsDraft(): void {
    this.snackBar.open('Save as draft feature coming soon', 'Close', {
      duration: 3000
    });
  }
}