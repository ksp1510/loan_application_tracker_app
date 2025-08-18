import { HttpClient, HttpEvent, HttpRequest, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export enum FileType {
  CONTRACT = 'contract',
  ID_PROOF = 'id_proof',
  BANK_STATEMENT = 'bank_statement',
  PAY_STUB = 'pay_stub',
  ADDITIONAL_DOC = 'additional_doc',
  PHOTO_ID = 'photo_id',
  PROOF_OF_ADDRESS = 'proof_of_address'
}

export interface UploadResponse {
  message: string;
  s3_key: string;
}

export interface MultiUploadResponse {
  uploaded: UploadResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Upload single file with progress tracking
  uploadSingleFile(
    applicationId: string, 
    file: File, 
    fileType: FileType
  ): Observable<HttpEvent<UploadResponse>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest(
      'POST',
      `${this.baseUrl}/applications/${applicationId}/upload?file_type=${fileType}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json'
      }
    );

    return this.http.request<UploadResponse>(req);
  }

  // Upload multiple files of different types
  uploadMultipleFiles(
    applicationId: string, 
    files: { [key in FileType]?: File }
  ): Observable<MultiUploadResponse> {
    const formData: FormData = new FormData();
    
    Object.entries(files).forEach(([fileType, file]) => {
      if (file) {
        formData.append(fileType, file);
      }
    });

    return this.http.post<MultiUploadResponse>(
      `${this.baseUrl}/applications/${applicationId}/upload-multi-type`,
      formData
    );
  }

  // Download file
  downloadFile(applicationId: string, fileType: FileType): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/applications/${applicationId}/download?file_type=${fileType}`,
      { responseType: 'blob' }
    );
  }

  // List files for an application
  listFiles(applicationId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/applications/${applicationId}/files`);
  }

  // Helper method to extract upload progress
  getUploadProgress(event: HttpEvent<any>): number | null {
    if (event.type === HttpEventType.UploadProgress && event.total) {
      return Math.round((100 * event.loaded) / event.total);
    }
    return null;
  }

  // Helper method to check if upload is complete
  isUploadComplete(event: HttpEvent<any>): boolean {
    return event.type === HttpEventType.Response;
  }

  // Download file with proper filename
  downloadFileWithName(applicationId: string, fileType: FileType): void {
    this.downloadFile(applicationId, fileType).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileType}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }
}