// services/mock-application.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { LoanApplication, PaginatedResponse } from './application.service';

@Injectable({ providedIn: 'root' })
export class MockApplicationService {

  private mockApplications: LoanApplication[] = [
    {
      _id: "675bc2df9187162ead8e73cb",
      main_applicant: {
        first_name: "Robert",
        last_name: "Smith",
        email: "robert.smith@example.com",
        cell_phone: "403-555-7890",
        date_of_birth: "1982-11-10",
        SIN: "987654320",
        address: {
          street: "123 Oak Rd",
          city: "Calgary",
          province: "AB",
          postal_code: "T2P 3P4",
          rent: 0,
          duration_at_address: 10,
        },
        marital_status: "Married",
        dependents: 1,
        status_in_canada: "Citizen",
        employment: {
          company_name: "Innovate Marketing",
          position: "Director",
          length_of_service: 7,
          gross_income: 120000,
          company_address: {
            street: "890 Business Ln",
            city: "Calgary",
            province: "AB",
            postal_code: "T1Y 1E4"
          },
          company_phone: "403-555-1111"
        },
        vehicle1: { year: 2019, make: "Ford", model: "F-150" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 10000,
          pt_income: 0,
          child_tax: 200,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 300,
          property_taxs: 400,
          child_support: 0,
          groceries: 800,
          car_insurence: 200,
          car_payment: 500,
          phone_bill: 100,
          internet: 100
        },
        loan: []
      },
      co_applicant: {
        first_name: "Emily",
        last_name: "Smith",
        email: "emily.smith@example.com",
        cell_phone: "403-555-1234",
        date_of_birth: "1984-07-25",
        SIN: "876543219",
        address: {
          street: "123 Oak Rd",
          city: "Calgary",
          province: "AB",
          postal_code: "T2P 3P4",
          rent: 0,
        duration_at_address: 10,
        },
        
        marital_status: "Married",
        dependents: 1,
        status_in_canada: "Citizen",
        employment: {
          company_name: "Self-Employed",
          position: "Freelance Graphic Designer",
          length_of_service: 5,
          gross_income: 60000,
          company_address: {
            street: "890 Home Studio",
            city: "Calgary",
            province: "AB",
            postal_code: "T1Y 3A2"
          },
          company_phone: "403-555-2222"
        },
        vehicle1: { year: 0, make: "", model: "" },
        vehicle2: { year: 2021, make: "Honda", model: "CR-V" },
        monthly_income: {
          ft_income: 5000,
          pt_income: 0,
          child_tax: 200,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 300,
          property_taxs: 400,
          child_support: 0,
          groceries: 800,
          car_insurence: 150,
          car_payment: 450,
          phone_bill: 80,
          internet: 100
        },
        loan: [
          {
            financial_institution: "CIBC",
            monthly_pymnt: 300
          }
        ]
      },
      amount: 20000,
      security: "Vehicle",
      status: "FUNDED",
      notes: "High-income borrower with co-applicant",
      reason: "Home renovation",
      application_date: "2024-12-13T10:15:43.000Z"
    },
    {
      _id: "675bc8a2e603ea229f013d20",
      main_applicant: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        cell_phone: "416-123-4567",
        date_of_birth: "1985-07-15",
        SIN: "123456789",
        address: {
          street: "123 Main St",
          city: "Toronto",
          province: "ON",
          postal_code: "M5H 2N2",
          rent: 1500,
          duration_at_address: 5,
        },
        marital_status: "Married",
        dependents: 2,
        status_in_canada: "Citizen",
        employment: {
          company_name: "Tech Solutions Inc.",
          position: "Software Engineer",
          length_of_service: 4,
          gross_income: 95000,
          company_address: {
            street: "456 Tech Ave",
            city: "Mississauga",
            province: "ON",
            postal_code: "L5B 1M7"
          },
          company_phone: "905-555-5678"
        },
        vehicle1: { year: 2020, make: "Toyota", model: "Camry" },
        vehicle2: { year: 2022, make: "Tesla", model: "Model 3" },
        monthly_income: {
          ft_income: 8000,
          pt_income: 0,
          child_tax: 400,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 200,
          property_taxs: 0,
          child_support: 0,
          groceries: 800,
          car_insurence: 150,
          car_payment: 400,
          phone_bill: 80,
          internet: 70
        },
        loan: [
          {
            financial_institution: "TD Bank",
            monthly_pymnt: 500
          },
          {
            financial_institution: "Scotiabank",
            monthly_pymnt: 300
          }
        ]
      },
      co_applicant: {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane.doe@example.com",
        cell_phone: "416-555-5678",
        date_of_birth: "1987-03-25",
        SIN: "987654321",
        address: {
          street: "123 Main St",
          city: "Toronto",
          province: "ON",
          postal_code: "M5H 2N2",
          rent: 1500,
          duration_at_address: 5,
        },
        marital_status: "Married",
        dependents: 2,
        status_in_canada: "Permanent Resident",
        employment: {
          company_name: "HealthCare Inc.",
          position: "Nurse",
          length_of_service: 6,
          gross_income: 75000,
          company_address: {
            street: "789 Care Blvd",
            city: "Toronto",
            province: "ON",
            postal_code: "M4B 1V4"
          },
          company_phone: "416-555-8765"
        },
        vehicle1: { year: 0, make: "", model: "" },
        vehicle2: { year: 2018, make: "Honda", model: "Civic" },
        monthly_income: {
          ft_income: 6250,
          pt_income: 0,
          child_tax: 400,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 200,
          property_taxs: 0,
          child_support: 0,
          groceries: 600,
          car_insurence: 120,
          car_payment: 300,
          phone_bill: 60,
          internet: 70
        },
        loan: []
      },
      amount: 18000,
      security: "Vehicle",
      status: "DECLINED",
      notes: "Too many existing loans",
      reason: "Debt consolidation",
      application_date: "2024-12-13T16:42:10.000Z"
    },
    {
      _id: "675bc2c69187162ead8e73ca",
      main_applicant: {
        first_name: "Alice",
        last_name: "Johnson",
        email: "alice.johnson@example.com",
        cell_phone: "604-555-6789",
        date_of_birth: "1990-02-15",
        SIN: "123456780",
        address: {
          street: "456 Elm St",
          city: "Vancouver",
          province: "BC",
          postal_code: "V6B 2W3",
          rent: 2000,
          duration_at_address: 3,
        },
        marital_status: "Single",
        dependents: 0,
        status_in_canada: "Citizen",
        employment: {
          company_name: "TechNova Corp",
          position: "Product Manager",
          length_of_service: 5,
          gross_income: 95000,
          company_address: {
            street: "789 Innovation Dr",
            city: "Vancouver",
            province: "BC",
            postal_code: "V5K 1A4"
          },
          company_phone: "604-555-1234"
        },
        vehicle1: { year: 2022, make: "Tesla", model: "Model 3" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 8500,
          pt_income: 0,
          child_tax: 0,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 250,
          property_taxs: 0,
          child_support: 0,
          groceries: 600,
          car_insurence: 120,
          car_payment: 600,
          phone_bill: 80,
          internet: 90
        },
        loan: [
          {
            financial_institution: "BMO",
            monthly_pymnt: 400
          }
        ]
      },
      amount: 12000,
      security: "Vehicle",
      status: "APPLIED",
      notes: "Waiting for document submission",
      reason: "Medical bills",
      application_date: "2024-12-13T10:13:26.000Z"
    },
    {
      _id: "688b99d7f0b636b7d1542f60",
      main_applicant: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        cell_phone: "416-555-1234",
        date_of_birth: "1990-01-01",
        SIN: "123456789",
        address: {
          street: "123 Main St",
          city: "Toronto",
          province: "ON",
          postal_code: "M5V 3E7",
          rent: 1200,
          duration_at_address: 24,
        },
        marital_status: "Single",
        dependents: 0,
        status_in_canada: "Citizen",
        employment: {
          company_name: "Tech Corp",
          position: "Developer",
          length_of_service: 36,
          gross_income: 85000,
          company_address: {
            street: "456 Tech Rd",
            city: "Toronto",
            province: "ON",
            postal_code: "M4B 1B4",
          },
          company_phone: "416-555-9876"
        },
        vehicle1: { year: 2020, make: "Toyota", model: "Camry" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 5000,
          pt_income: 500,
          child_tax: 0,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 150,
          property_taxs: 0,
          child_support: 0,
          groceries: 400,
          car_insurence: 180,
          car_payment: 300,
          phone_bill: 80,
          internet: 60
        },
        loan: [
          {
            financial_institution: "Bank of A",
            monthly_pymnt: 250
          }
        ]
      },
      amount: 15000,
      security: "Vehicle",
      status: "APPLIED",
      notes: "First-time applicant.",
      reason: "Car repair and urgent expenses",
      application_date: "2025-07-31T16:22:01.172Z"
    },
    {
      _id: "68918277bf5648cbd820f250",
      main_applicant: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        cell_phone: "4161234567",
        date_of_birth: "1990-01-15",
        SIN: "123456789",
        address: {
          street: "123 Main Street",
          city: "Toronto",
          province: "Ontario",
          postal_code: "M4B1B3",
          rent: 1200,
          duration_at_address: 24,
        },
        marital_status: "Single",
        dependents: 0,
        status_in_canada: "Citizen",
        employment: {
          company_name: "TechCorp",
          position: "Engineer",
          length_of_service: 36,
          gross_income: 75000,
          company_address: {
            street: "500 Tech Road",
            city: "Toronto",
            province: "Ontario",
            postal_code: "M1B2K3",
          },
          company_phone: "4167654321"
        },
        vehicle1: { year: 2020, make: "Toyota", model: "Camry" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 4000,
          pt_income: 0,
          child_tax: 0,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 200,
          property_taxs: 0,
          child_support: 0,
          groceries: 300,
          car_insurence: 150,
          car_payment: 300,
          phone_bill: 60,
          internet: 50
        },
        loan: [
          {
            financial_institution: "Bank A",
            monthly_pymnt: 250
          }
        ]
      },
      amount: 10000,
      security: "Vehicle",
      status: "APPLIED",
      notes: "Initial application submission",
      reason: "Personal loan for vehicle",
      application_date: "2025-08-05T04:03:03.945Z"
    },
    {
      _id: "68918322bf5648cbd820f251",
      main_applicant: {
        first_name: "Alice",
        last_name: "Brown",
        email: "alice@example.com",
        cell_phone: "6471234567",
        date_of_birth: "1990-04-12",
        SIN: "123456789",
        address: {
          street: "123 Main St",
          city: "Toronto",
          province: "ON",
          postal_code: "M1A1A1",
          rent: 1200,
          duration_at_address: 36,
        },
        marital_status: "Single",
        dependents: 1,
        status_in_canada: "Permanent Resident",
        employment: {
          company_name: "TechCorp",
          position: "Developer",
          length_of_service: 24,
          gross_income: 80000,
          company_address: {
            street: "456 Tech Ave",
            city: "Toronto",
            province: "ON",
            postal_code: "M1B2B2",
          },
          company_phone: "4169876543"
        },
        vehicle1: { year: 2019, make: "Toyota", model: "Corolla" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 3000,
          pt_income: 0,
          child_tax: 0,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 150,
          property_taxs: 100,
          child_support: 0,
          groceries: 400,
          car_insurence: 120,
          car_payment: 300,
          phone_bill: 80,
          internet: 60
        },
        loan: [
          {
            financial_institution: "Bank A",
            monthly_pymnt: 250
          }
        ]
      },
      amount: 5000,
      security: "Vehicle",
      status: "APPLIED",
      notes: "New applicant",
      reason: "Debt consolidation",
      application_date: "2025-08-05T04:05:54.649Z"
    },
    {
      _id: "689cd08e1318d42ff918869c",
      main_applicant: {
        first_name: "Priya",
        last_name: "Sharma",
        email: "priya.sharma@example.com",
        cell_phone: "647-555-2134",
        date_of_birth: "1990-03-15",
        SIN: "456-789-123",
        address: {
          street: "12 Maplewood Drive",
          city: "Toronto",
          province: "ON",
          postal_code: "M5G 2K2",
          rent: 1800,
          duration_at_address: 48,
        },
        marital_status: "Married",
        dependents: 2,
        status_in_canada: "Permanent Resident",
        employment: {
          company_name: "TechNova Solutions",
          position: "Software Engineer",
          length_of_service: 60,
          gross_income: 95000,
          company_address: {
            street: "88 King Street",
            city: "Toronto",
            province: "ON",
            postal_code: "M5C 1G3",
          },
          company_phone: "416-555-7722"
        },
        vehicle1: { year: 2021, make: "Honda", model: "Civic" },
        vehicle2: { year: 2016, make: "Toyota", model: "Camry" },
        monthly_income: {
          ft_income: 7900,
          pt_income: 0,
          child_tax: 400,
          govt_support: 0,
          pension: 0,
          other_income: 0,
        },
        monthly_expenses: {
          utilities: 250,
          property_taxs: 0,
          child_support: 0,
          groceries: 600,
          car_insurence: 150,
          car_payment: 350,
          phone_bill: 120,
          internet: 80
        },
        loan: []
      },
      co_applicant: {
        first_name: "Priya",
        last_name: "Sharma",
        email: "priya.sharma@example.com",
        cell_phone: "647-555-7890",
        date_of_birth: "1992-11-14",
        SIN: "789-456-123",
        address: {
          street: "45 Bayview Ave",
          city: "Toronto",
          province: "ON",
          postal_code: "M4N 3M3",
          rent: 1200,
          duration_at_address: 3,
        },
        marital_status: "Married",
        dependents: 1,
        status_in_canada: "Permanent Resident",
        employment: {
          company_name: "BrightPath Education",
          position: "Teacher",
          length_of_service: 2,
          gross_income: 55000,
          company_address: {
            street: "200 Main St",
            city: "Toronto",
            province: "ON",
            postal_code: "M1P 4X7"
          },
          company_phone: "647-555-2233"
        },
        vehicle1: { year: 2023, make: "Hyundai", model: "Tucson" },
        vehicle2: { year: 0, make: "", model: "" },
        monthly_income: {
          ft_income: 4580,
          pt_income: 0,
          child_tax: 0,
          govt_support: 0,
          pension: 0,
          other_income: 0
        },
        monthly_expenses: {
          utilities: 200,
          property_taxs: 0,
          child_support: 0,
          groceries: 500,
          car_insurence: 120,
          car_payment: 400,
          phone_bill: 70,
          internet: 60
        },
        loan: []
      },
      amount: 30000,
      security: "Vehicle",
      status: "APPROVED",
      notes: "Updated approved amount after income verification and credit check.",
      reason: "Home Renovation - Extended Budget",
      application_date: "2025-08-13T17:51:10.195Z"
    }
  ];

  constructor() {
    console.log('🎯 MockApplicationService initialized with', this.mockApplications.length, 'applications');
  }

  // GET /applications?status=
  getAllApplications(status?: string): Observable<LoanApplication[]> {
    console.log('📋 MockService: getAllApplications called with status:', status);
    
    let filtered = this.mockApplications;
    if (status) {
      filtered = this.mockApplications.filter(app => app.status === status);
    }
    
    return of(filtered).pipe(delay(800)); // Simulate network delay
  }

  // GET /applications/{id}
  getApplicationById(id: string): Observable<LoanApplication> {
    console.log('🔍 MockService: getApplicationById called with id:', id);
    
    const app = this.mockApplications.find(a => a._id === id);
    if (!app) {
      return throwError(() => new Error('Application not found'));
    }
    
    return of(app).pipe(delay(500));
  }

  // GET /applications/search?first_name=&last_name=
  searchByName(firstName: string, lastName: string): Observable<LoanApplication> {
    console.log('🔍 MockService: searchByName called:', firstName, lastName);
    
    const app = this.mockApplications.find(a => 
      a.main_applicant.first_name.toLowerCase() === firstName.toLowerCase() &&
      a.main_applicant.last_name.toLowerCase() === lastName.toLowerCase()
    );
    
    if (!app) {
      return throwError(() => new Error('Application not found'));
    }
    
    return of(app).pipe(delay(600));
  }

  // POST /applications
  createApplication(application: Partial<LoanApplication>): Observable<{ id: string }> {
    console.log('➕ MockService: createApplication called');
    
    const newId = `mock_${Date.now()}`;
    const newApp: LoanApplication = {
      ...application as LoanApplication,
      _id: newId,
      application_date: new Date().toISOString(),
      status: application.status || 'APPLIED'
    };
    
    this.mockApplications.unshift(newApp); // Add to beginning
    console.log('✅ Application created with ID:', newId);
    
    return of({ id: newId }).pipe(delay(1200));
  }

  // PUT /applications/{id}
  updateApplication(id: string, updates: Partial<LoanApplication>): Observable<{ message: string }> {
    console.log('✏️ MockService: updateApplication called for id:', id);
    
    const index = this.mockApplications.findIndex(a => a._id === id);
    if (index === -1) {
      return throwError(() => new Error('Application not found'));
    }
    
    this.mockApplications[index] = { ...this.mockApplications[index], ...updates };
    console.log('✅ Application updated successfully');
    
    return of({ message: 'Application updated successfully' }).pipe(delay(800));
  }

  // GET /applications/report?start_date=&end_date=&status=&page=&page_size=
  getFilteredApplications(
    startDate?: string,
    endDate?: string,
    status?: string,
    page = 1,
    pageSize = 10
  ): Observable<PaginatedResponse> {
    console.log('📊 MockService: getFilteredApplications called');
    
    let filtered = this.mockApplications;
    
    // Filter by status
    if (status) {
      filtered = filtered.filter(app => app.status === status);
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.application_date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        return appDate >= start && appDate <= end;
      });
    }
    
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    
    const response: PaginatedResponse = {
      data,
      total,
      page,
      page_size: pageSize,
      pages: Math.ceil(total / pageSize)
    };
    
    return of(response).pipe(delay(900));
  }

  // GET /applications/report/download?format=pdf|excel
  downloadReport(
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string,
    status?: string
  ): Observable<Blob> {
    console.log('📥 MockService: downloadReport called for format:', format);
    
    // Create mock report data
    const reportData = {
      report_type: `Loan Applications Report (${format.toUpperCase()})`,
      generated_at: new Date().toISOString(),
      filters: {
        start_date: startDate,
        end_date: endDate,
        status: status
      },
      summary: {
        total_applications: this.mockApplications.length,
        by_status: this.getStatusBreakdown()
      },
      applications: this.mockApplications.map(app => ({
        id: app._id,
        applicant: `${app.main_applicant.first_name} ${app.main_applicant.last_name}`,
        amount: app.amount,
        status: app.status,
        date: app.application_date
      }))
    };
    
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { 
      type: format === 'excel' ? 'application/vnd.ms-excel' : 'application/pdf' 
    });
    
    return of(blob).pipe(delay(2000)); // Simulate longer processing time
  }

  // Helper method for status breakdown
  private getStatusBreakdown(): Record<string, number> {
    return this.mockApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Development helper methods
  getStatistics() {
    const stats = {
      total: this.mockApplications.length,
      by_status: this.getStatusBreakdown(),
      by_security: this.mockApplications.reduce((acc, app) => {
        acc[app.security] = (acc[app.security] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_amount: this.mockApplications.reduce((sum, app) => sum + app.amount, 0)
    };
    
    console.log('📈 Mock Service Statistics:', stats);
    return stats;
  }
}