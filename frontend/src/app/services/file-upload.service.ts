import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  uploadFile(applicationId: string, file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/applications/${applicationId}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  downloadFile(applicationId: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/applications/${applicationId}/files/${filename}`, {
      responseType: 'blob'
    });
  }
}