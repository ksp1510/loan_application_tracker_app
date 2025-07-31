import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = environment.apiUrl;  // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  getApplicationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/${id}`);
  }

  uploadFiles(applicationId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/files`, formData);
  }

  updateNotes(applicationId: string, notesData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${applicationId}/notes`, notesData);
  }

  getAllApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications`);
  }

  addApplication(applicationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications`, applicationData);
  }

  generateReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports`);
  }

  updateApplication(application_number: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${application_number}`, updateData);
  }
  
}
