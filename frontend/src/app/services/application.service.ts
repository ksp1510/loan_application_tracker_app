//application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoanApplication {
  _id: string;
  main_applicant: {
    first_name: string;
    last_name: string;
    email: string;
    cell_phone: string;
    date_of_birth: string;
    SIN: string;
    address: {
      street: string;
      city: string;
      province: string;
      postal_code: string;
    };
    rent: number;
    duration_at_address: number;
    marital_status: string;
    dependents: number;
    status_in_canada: string;
    ft_employment?: {
      company_name: string;
      position: string;
      length_of_service: number;
      gross_income: number;
      company_address: {
        street: string;
        city: string;
        province: string;
        postal_code: string;
      };
      company_phone: string;
    };
    vehicle1?: { year: number; make: string; model: string };
    vehicle2?: { year: number; make: string; model: string };
    monthly_income: {
      ft_income: number;
      pt_income: number;
      child_tax: number;
      govt_support: number;
      pension: number;
    };
    monthly_expenses: {
      utilities: number;
      property_taxs: number;
      child_support: number;
      groceries: number;
      car_insurence: number;
      car_payment: number;
      phone_bill: number;
      internet: number;
    };
    loan?: Array<{
      financial_institution: string;
      monthly_pymnt: number;
    }>;
  };
  co_applicant?: any;
  amount: number;
  security: 'Vehicle' | 'Property' | 'Co-Signer' | 'N/A';
  status: 'APPLIED' | 'APPROVED' | 'FUNDED' | 'DECLINED';
  notes?: string;
  reason?: string;
  application_date: string;
}

export interface PaginatedResponse {
  data: LoanApplication[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = 'http://localhost:8000/applications'; // ✅ backend root

  constructor(private http: HttpClient) {}

  // ✅ GET /applications?status=
  getAllApplications(status?: string): Observable<LoanApplication[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<LoanApplication[]>(this.apiUrl, { params });
  }

  // ✅ GET /applications/{id}
  getApplicationById(id: string): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.apiUrl}/${id}`);
  }

  // ✅ GET /applications/search?first_name=&last_name=
  searchByName(firstName: string, lastName: string): Observable<LoanApplication> {
    const params = new HttpParams()
      .set('first_name', firstName)
      .set('last_name', lastName);
    return this.http.get<LoanApplication>(`${this.apiUrl}/search`, { params });
  }

  // ✅ POST /applications
  createApplication(application: Partial<LoanApplication>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, application);
  }

  // ✅ PUT /applications/{id}
  updateApplication(id: string, updates: Partial<LoanApplication>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, updates);
  }

  // ✅ GET /applications/report?start_date=&end_date=&status=&page=&page_size=
  getFilteredApplications(
    startDate?: string,
    endDate?: string,
    status?: string,
    page = 1,
    pageSize = 10
  ): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResponse>(`${this.apiUrl}/report`, { params });
  }

  // ✅ GET /applications/report/download?format=pdf|excel
  downloadReport(
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string,
    status?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/report/download`, {
      params,
      responseType: 'blob'
    });
  }
}
