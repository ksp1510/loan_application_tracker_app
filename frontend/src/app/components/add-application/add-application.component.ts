// src/app/components/add-application/add-application.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.css']
})
export class AddApplicationComponent implements OnInit {
onCancel() {
throw new Error('Method not implemented.');
}
  applicationForm!: FormGroup;
  provinces: string[] = [ 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Northwest Territories', 'Yukon', 'Nunavut'];
  vehicleYears: number[] = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i); // Past 40 years
  vehicleMakes: string[] = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Volkswagen'  ];
  maritalStatuses: string[] = ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'];
  statusesInCanada: string[] = ['Citizen', 'Permanent Resident', 'Work Permit', 'Student Permit', 'Refugee'];
  securities: string[] = ['Vehicle', 'Property', 'N/A'];
  applicationStatuses: string[] = ['APPLIED', 'FUNDED', 'DECLINED'];

  totalIncome: number = 0;
  totalExpenses: number = 0;

  constructor(
    private fb: FormBuilder,
    private appService: ApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.applicationForm = this.fb.group({
      main_applicant: this.fb.group({
        first_name: ['', Validators.required],
        middle_name: [''],
        last_name: ['', Validators.required],
        date_of_birth: ['', Validators.required],
        SIN: ['', Validators.required],
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          province: ['', Validators.required],
          postal_code: ['', [Validators.required, Validators.pattern(/^([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d)$/)]]
        }),
        duration_at_address: ['', Validators.required],
        rent: ['', Validators.required],
        cell_phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        marital_status: ['', Validators.required],
        dependents: ['', Validators.required],
        status_in_canada: ['', Validators.required],
        ft_employment: this.fb.group({
          company_name: [''],
          position: [''],
          length_of_service: [''],
          gross_income: [''],
          company_address: this.fb.group({
            street: [''],
            city: [''],
            province: [''],
            postal_code: ['']
          }),
          company_phone: ['']
        }),
        vehicle1: this.fb.group({
          year: [''],
          make: [''],
          model: ['']
        }),
        vehicle2: this.fb.group({
          year: [''],
          make: [''],
          model: ['']
        }),
        monthly_expenses: this.fb.group({
          utilities: [0],
          property_taxs: [0],
          child_support: [0],
          groceries: [0],
          car_insurence: [0],
          car_payment: [0],
          phone_bill: [0],
          internet: [0]
        }),
        monthly_income: this.fb.group({
          ft_income: [0],
          pt_income: [0],
          child_tax: [0],
          govt_support: [0],
          pension: [0]
        }),
        loan: this.fb.array([])
      }),
      co_applicant: null,
      hasCoApplicant: [false],
      amount: [''],
      security: [''],
      status: ['', Validators.required],
      notes: [''],
      application_date: [new Date()],
      reason: ['']
    });

    this.setupIncomeCalculation();
    this.setupExpenseCalculation();
    this.toggleCoApplicant();
  }

  get loanFormArray(): FormArray {
    return (this.applicationForm.get('main_applicant.loan') as FormArray);
  }

  addLoan(): void {
    const loanGroup = this.fb.group({
      financial_institution: [''],
      monthly_pymnt: ['']
    });
    this.loanFormArray.push(loanGroup);
  }

  setupIncomeCalculation(): void {
    const incomeGroup = this.applicationForm.get('main_applicant.monthly_income') as FormGroup;
    incomeGroup.valueChanges.subscribe(values => {
      this.totalIncome = Object.values(values).reduce((acc: number, val: unknown) => {
        const numVal = Number(val) || 0;
        return acc + numVal;
      }, 0);
    });
  }

  setupExpenseCalculation(): void {
    const expenseGroup = this.applicationForm.get('main_applicant.monthly_expenses') as FormGroup;
    expenseGroup.valueChanges.subscribe(values => {
      this.totalExpenses = Object.values(values).reduce((acc: number, val: unknown) => {
        const numVal = Number(val) || 0;
        return acc + numVal;
      }, 0);
    });
  }

  get hasCoApplicant(): boolean {
    return this.applicationForm.get('hasCoApplicant')?.value || false;
  }

  toggleCoApplicant(): void {
    this.applicationForm.get('hasCoApplicant')?.valueChanges.subscribe(value => {
      if (value) {
        this.applicationForm.addControl('co_applicant', this.fb.group({
          first_name: ['', Validators.required],
          middle_name: [''],
          last_name: ['', Validators.required],
          date_of_birth: ['', Validators.required],
          SIN: ['', Validators.required],
          address: this.fb.group({
            street: ['', Validators.required],
            city: ['', Validators.required],
            province: ['', Validators.required],
            postal_code: ['', [Validators.required, Validators.pattern(/^([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d)$/)]]
          }),
          duration_at_address: ['', Validators.required],
          rent: ['', Validators.required],
          cell_phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
          email: ['', [Validators.required, Validators.email]],
          marital_status: ['', Validators.required],
          dependents: ['', Validators.required],
          status_in_canada: ['', Validators.required]
        }));
      } else {
        this.applicationForm.removeControl('co_applicant');
      }
    });
  }

  onSubmit(): void {
    console.log(this.applicationForm.value);
  }
}
