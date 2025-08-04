// add-application.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.css']
})
export class AddApplicationComponent implements OnInit {
  applicationForm!: FormGroup;
  totalExpenses: number = 0;
  totalIncome: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.applicationForm = this.fb.group({
      amount: ['', Validators.required],
      security: ['', Validators.required],
      status: ['', Validators.required],
      notes: [''],
      reason: [''],
      hasCoApplicant: [false],
      main_applicant: this.buildApplicantForm(),
      co_applicant: this.buildApplicantForm(),
      loan: this.fb.array([])
    });

    this.handleCoApplicantToggle();
    this.setupReactiveCalculations();
  }

  private buildApplicantForm(): FormGroup {
    return this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      SIN: [''],
      email: ['', [Validators.required, Validators.email]],
      cell_phone: ['', Validators.required],
      marital_status: [''],
      dependents: [0],
      status_in_canada: [''],
      rent: [0],
      duration_at_address: [0],
      address: this.fb.group({
        street: [''],
        city: [''],
        province: [''],
        postal_code: ['']
      }),
      ft_employment: this.fb.group({
        company_name: [''],
        position: [''],
        length_of_service: [0],
        gross_income: [0],
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
      monthly_income: this.fb.group({
        ft_income: [0],
        pt_income: [0],
        child_tax: [0],
        govt_support: [0],
        pension: [0]
      }),
      monthly_expenses: this.fb.group({
        utilities: [0],
        property_taxes: [0],
        child_support: [0],
        groceries: [0],
        car_insurence: [0],
        car_payment: [0],
        phone_bill: [0],
        internet: [0]
      }),
      loan: this.fb.array([])
    });
  }

  get loanFormArray(): FormArray {
    return this.applicationForm.get('loan') as FormArray;
  }

  addLoan(): void {
    const loanGroup = this.fb.group({
      financial_institution: [''],
      monthly_pymnt: [0]
    });
    this.loanFormArray.push(loanGroup);
  }

  isInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      console.log('Application Submitted', this.applicationForm.value);
      // TODO: integrate with backend
    } else {
      this.applicationForm.markAllAsTouched();
    }
  }

  private handleCoApplicantToggle(): void {
    this.applicationForm.get('hasCoApplicant')?.valueChanges.subscribe(value => {
      const coApplicantGroup = this.applicationForm.get('co_applicant') as FormGroup;
      if (!value) coApplicantGroup.reset();
    });
  }

  private setupReactiveCalculations(): void {
    const calcTotal = (group: FormGroup): number =>
      Object.values(group.controls).reduce((sum, ctrl) => sum + (+ctrl.value || 0), 0);

    const updateTotals = () => {
      const main = this.applicationForm.get('main_applicant') as FormGroup;
      const income = main.get('monthly_income') as FormGroup;
      const expenses = main.get('monthly_expenses') as FormGroup;
      this.totalIncome = calcTotal(income);
      this.totalExpenses = calcTotal(expenses);
    };

    this.applicationForm.valueChanges.subscribe(() => updateTotals());
  }
}
