import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from '../../shared/material.module';

import { ApplicationService, LoanApplication, PaginatedResponse } from '../../services/application.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  standalone: true,
  imports: [MaterialModule]
})
export class ReportsComponent implements OnInit {
  reportForm!: FormGroup;
  dataSource = new MatTableDataSource<LoanApplication>();
  
  displayedColumns: string[] = [
    'applicant',
    'amount', 
    'security',
    'status',
    'application_date'
  ];

  applicationStatuses = ['APPLIED', 'APPROVED', 'FUNDED', 'DECLINED'];
  
  // Pagination
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Loading states
  isLoading = false;
  isExporting = false;
  error = '';

  // Summary stats
  summaryStats = {
    totalApplications: 0,
    totalAmount: 0,
    avgAmount: 0,
    statusBreakdown: {} as Record<string, number>
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSummary();
    this.loadInitialData();
  }

  loadSummary(): void {
    // Mock summary data for now
    this.summaryStats = {
      totalApplications: 0,
      totalAmount: 0,
      avgAmount: 0,
      statusBreakdown: {
        'APPLIED': 0,
        'APPROVED': 0,
        'FUNDED': 0,
        'DECLINED': 0
      }
    };
  }
  
  private initializeForm(): void {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.reportForm = this.fb.group({
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
      status: ['']
    });
  }

  private loadInitialData(): void {
    // Load data with default filters
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.reportForm.invalid) {
      this.snackBar.open('Please select valid date range', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.currentPage = 0;
    this.loadReportData();
  }

  private loadReportData(): void {
    const formValues = this.reportForm.value;
    const startDate = this.formatDate(formValues.startDate);
    const endDate = this.formatDate(formValues.endDate);
    const status = formValues.status || undefined;

    this.isLoading = true;
    this.error = '';

    this.applicationService.getFilteredApplications(
      startDate,
      endDate,
      status,
      this.currentPage + 1,
      this.pageSize
    ).subscribe({
      next: (response: PaginatedResponse) => {
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        this.calculateSummaryStats(response.data, response.total);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report data:', error);
        this.error = 'Failed to load report data';
        this.isLoading = false;
        this.snackBar.open('Failed to load report data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReportData();
  }

  private calculateSummaryStats(applications: LoanApplication[], total: number): void {
    this.summaryStats = {
      totalApplications: total,
      totalAmount: applications.reduce((sum, app) => sum + (app.amount || 0), 0),
      avgAmount: applications.length > 0 
        ? applications.reduce((sum, app) => sum + (app.amount || 0), 0) / applications.length
        : 0,
      statusBreakdown: applications.reduce((breakdown, app) => {
        breakdown[app.status] = (breakdown[app.status] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>)
    };
  }

  // Export methods
  exportToPDF(): void {
    this.exportReport('pdf');
  }

  exportToExcel(): void {
    this.exportReport('excel');
  }

  private exportReport(format: 'pdf' | 'excel'): void {
    if (this.reportForm.invalid) {
      this.snackBar.open('Please select valid date range before exporting', 'Close', {
        duration: 3000
      });
      return;
    }

    const formValues = this.reportForm.value;
    const startDate = this.formatDate(formValues.startDate);
    const endDate = this.formatDate(formValues.endDate);
    const status = formValues.status || undefined;

    this.isExporting = true;

    this.applicationService.downloadReport(format, startDate, endDate, status).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, format);
        this.isExporting = false;
        this.snackBar.open(`${format.toUpperCase()} report downloaded successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Export error:', error);
        this.isExporting = false;
        this.snackBar.open(`Failed to export ${format.toUpperCase()} report`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private downloadBlob(blob: Blob, format: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `loan-applications-report-${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  formatDate2(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'APPLIED': 'status-applied',
      'APPROVED': 'status-approved',
      'FUNDED': 'status-funded', 
      'DECLINED': 'status-declined'
    };
    return statusClasses[status] || 'status-default';
  }

  clearFilters(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.reportForm.patchValue({
      startDate: startDate,
      endDate: endDate,
      status: ''
    });
    
    this.applyFilter();
  }

  // Quick filter presets
  setDateRange(days: number): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    this.reportForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
    
    this.applyFilter();
  }

  setCurrentMonth(): void {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.reportForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
    
    this.applyFilter();
  }

  setPreviousMonth(): void {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    
    this.reportForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
    
    this.applyFilter();
  }

  // Validation helpers
  isDateRangeValid(): boolean {
    const { startDate, endDate } = this.reportForm.value;
    return startDate && endDate && startDate <= endDate;
  }

  getDateRangeError(): string {
    const { startDate, endDate } = this.reportForm.value;
    if (!startDate || !endDate) return 'Both dates are required';
    if (startDate > endDate) return 'Start date must be before end date';
    return '';
  }

  // Summary calculations
  getStatusPercentage(status: string): number {
    const count = this.summaryStats.statusBreakdown[status] || 0;
    return this.summaryStats.totalApplications > 0 
      ? (count / this.summaryStats.totalApplications) * 100 
      : 0;
  }

  get hasData(): boolean {
    return this.dataSource.data.length > 0;
  }

  get dateRangeText(): string {
    const { startDate, endDate } = this.reportForm.value;
    if (startDate && endDate) {
      return `${this.formatDate2(startDate)} - ${this.formatDate2(endDate)}`;
    }
    return '';
  }
}