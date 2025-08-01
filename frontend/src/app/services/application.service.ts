// Service: application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private baseUrl = 'http://localhost:8000'; // adjust for prod

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/applications`);
  }

  getApplicationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/applications/${id}`);
  }

  searchByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/applications/search?name=${name}`);
  }

  createApplication(application: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/applications`, application);
  }

  updateNotes(id: string, payload: { notes: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/applications/${id}`, payload);
  }

  updateApplication(id: string, application: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/applications/${id}`, application);
  }

  deleteApplication(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/applications/${id}`);
  }

  uploadFile(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/applications/${id}/upload`, formData);
  }

  getFiles(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/applications/${id}/files`);
  }

  downloadFile(id: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/applications/${id}/files/${filename}`, { responseType: 'blob' });
  }

  getFilteredApplications(startDate: string, endDate: string, status = '', page = 1, pageSize = 10): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('page', page)
      .set('page_size', pageSize);
  
    if (status) {
      params = params.set('status', status);
    }
  
    return this.http.get<any>(`${this.baseUrl}/applications/report`, { params });
  }
  

  getReport(filters: any): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/applications/reports`, {
      params: filters,
      responseType: 'blob'
    });
  }
}