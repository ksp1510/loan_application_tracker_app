// Service: application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  uploadFiles(id: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/applications/${id}/upload`, formData);
  }

  downloadFile(id: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/applications/${id}/files/${filename}`, { responseType: 'blob' });
  }

  getReport(filters: any): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports`, {
      params: filters,
      responseType: 'blob'
    });
  }
}