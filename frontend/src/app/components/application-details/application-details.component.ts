import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { Observable } from 'rxjs';

import { ApplicationService, LoanApplication } from '../../services/application.service';
import { FileUploadService, FileType } from '../../services/file-upload.service';

interface FileUploadProgress {
  [key: string]: {
    progress: number;
    uploading: boolean;
    completed: boolean;
    error?: string;
  };
}

@Component({
    selector: 'app-application-details',
    templateUrl: './application-details.component.html',
    styleUrls: ['./application-details.component.css'],
    standalone: true,
    imports: [
      MaterialModule
    ]
})
export class ApplicationDetailsComponent implements OnInit {
  applicationId!: string;
  application?: LoanApplication;
  editForm!: FormGroup;
  isLoading = false;
  isEditing = false;
  error = '';

  // File upload related
  uploadProgress: FileUploadProgress = {};
  uploadedFiles: string[] = [];
  availableFileTypes = Object.values(FileType);

  // Status options
  statusOptions = [
    { value: 'APPLIED', label: 'Applied', color: '#ff9800' },
    { value: 'APPROVED', label: 'Approved', color: '#4caf50' },
    { value: 'FUNDED', label: 'Funded', color: '#2196f3' },
    { value: 'DECLINED', label: 'Declined', color: '#f44336' }
  ];

  securityOptions = [
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Property', label: 'Property' },
    { value: 'Co-Signer', label: 'Co-Signer' },
    { value: 'N/A', label: 'N/A' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private fileService: FileUploadService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id')!;
    if (this.applicationId) {
      this.loadApplication();
      this.loadUploadedFiles();
    }
  }

  private initializeForm(): void {
    this.editForm = this.fb.group({
      status: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      security: ['', Validators.required],
      notes: [''],
      reason: ['']
    });
  }

  public loadApplication(): void {
    this.isLoading = true;
    this.error = '';

    this.applicationService.getApplicationById(this.applicationId).subscribe({
      next: (application) => {
        this.application = application;
        this.populateForm(application);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.error = 'Failed to load application details';
        this.isLoading = false;
        this.snackBar.open('Failed to load application', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private populateForm(application: LoanApplication): void {
    this.editForm.patchValue({
      status: application.status,
      amount: application.amount,
      security: application.security,
      notes: application.notes || '',
      reason: application.reason || ''
    });
  }

  private loadUploadedFiles(): void {
    this.fileService.listFiles(this.applicationId).subscribe({
      next: (files) => {
        this.uploadedFiles = files;
      },
      error: (error) => {
        console.error('Error loading files:', error);
      }
    });
  }

  // Form submission
  saveChanges(): void {
    if (this.editForm.valid) {
      const updates = this.editForm.value;
      
      this.applicationService.updateApplication(this.applicationId, updates).subscribe({
        next: (response) => {
          this.snackBar.open('Application updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isEditing = false;
          this.loadApplication(); // Reload to get fresh data
        },
        error: (error) => {
          console.error('Error updating application:', error);
          this.snackBar.open('Failed to update application', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.editForm.markAllAsTouched();
      this.snackBar.open('Please fix the form errors', 'Close', {
        duration: 3000
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.application) {
      this.populateForm(this.application);
    }
  }

  // File upload methods
  onFileSelected(event: any, fileType: FileType): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadFile(file, fileType);
    }
  }

  private uploadFile(file: File, fileType: FileType): void {
    // Initialize progress tracking
    this.uploadProgress[fileType] = {
      progress: 0,
      uploading: true,
      completed: false
    };

    this.fileService.uploadSingleFile(this.applicationId, file, fileType).subscribe({
      next: (event) => {
        const progress = this.fileService.getUploadProgress(event);
        if (progress !== null) {
          this.uploadProgress[fileType].progress = progress;
        }

        if (this.fileService.isUploadComplete(event)) {
          this.uploadProgress[fileType] = {
            progress: 100,
            uploading: false,
            completed: true
          };
          
          this.snackBar.open(`${fileType} uploaded successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          this.loadUploadedFiles();
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadProgress[fileType] = {
          progress: 0,
          uploading: false,
          completed: false,
          error: 'Upload failed'
        };
        
        this.snackBar.open(`Failed to upload ${fileType}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  downloadFile(fileType: FileType): void {
    this.fileService.downloadFileWithName(this.applicationId, fileType);
  }

  // Utility methods
  getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.color || '#666';
  }

  getFileDisplayName(fileType: FileType): string {
    return fileType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  isFileUploaded(fileType: FileType): boolean {
    return this.uploadedFiles.includes(`${fileType}.pdf`);
  }

  getUploadStatus(fileType: FileType): string {
    const progress = this.uploadProgress[fileType];
    if (!progress) return 'Ready to upload';
    if (progress.uploading) return `Uploading... ${progress.progress}%`;
    if (progress.completed) return 'Upload complete';
    if (progress.error) return progress.error;
    return 'Ready to upload';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Calculate financial totals
  getTotalIncome(): number {
    if (!this.application?.main_applicant.monthly_income) return 0;
    const income = this.application.main_applicant.monthly_income;
    return (income.ft_income || 0) + 
           (income.pt_income || 0) + 
           (income.child_tax || 0) + 
           (income.govt_support || 0) + 
           (income.pension || 0);
  }

  getTotalExpenses(): number {
    if (!this.application?.main_applicant.monthly_expenses) return 0;
    const expenses = this.application.main_applicant.monthly_expenses;
    return (expenses.utilities || 0) + 
           (expenses.property_taxs || 0) + 
           (expenses.child_support || 0) + 
           (expenses.groceries || 0) + 
           (expenses.car_insurence || 0) + 
           (expenses.car_payment || 0) + 
           (expenses.phone_bill || 0) + 
           (expenses.internet || 0);
  }

  getNetIncome(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}