import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
// Make sure the path is correct; if the service is in 'src/app/services/', use:
import { ApplicationService } from '../../services/application.service';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.css']
})
export class ApplicationDetailsComponent implements OnInit {
  @Input() applicationId!: string;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadedFiles: string[] = []; // Assume backend gives a way to list them
  application: any;
  notes: string = '';
  files: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private fileService: FileUploadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUploadedFiles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.applicationService.getApplicationById(id).subscribe((data) => {
        this.application = data;
        this.notes = data.notes;
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.applicationId && this.selectedFile) {
      this.fileService.uploadFile(this.applicationId, this.selectedFile).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.snackBar.open('File uploaded successfully!', 'Close', {
            duration: 3000
          });
          this.uploadProgress = 0;
          this.selectedFile = null;
          this.loadUploadedFiles();
        }
      }, error => {
        this.snackBar.open('File upload failed.', 'Close', {
          duration: 3000
        });
      });
    }
  }

  downloadFile(filename: string): void {
    this.fileService.downloadFile(this.applicationId, filename).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      this.snackBar.open('Failed to download file.', 'Close', {
        duration: 3000
      });
    });
  }

  loadUploadedFiles(): void {
    if (this.applicationId) {
      this.fileService.getUploadedFiles(this.applicationId).subscribe(files => {
        this.uploadedFiles = files;
      }, error => {
        this.snackBar.open('Failed to load uploaded files.', 'Close', {
          duration: 3000
        });
      });
    }
  }


  saveNotes() {
    this.applicationService.updateNotes(this.application.id, { notes: this.notes }).subscribe(
      (response) => {
        console.log('Notes saved successfully', response);
        alert('Notes saved successfully');
      },
      (error) => {
        console.error('Failed to save notes', error);
        alert('Failed to save notes');
      }
    );
  }
}