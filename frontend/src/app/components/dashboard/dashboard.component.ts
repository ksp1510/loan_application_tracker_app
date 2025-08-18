import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationService, LoanApplication } from '../../services/application.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SummaryCard {
  title: string;
  icon: string;
  count: number;
  color: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'applicant',
    'amount',
    'security',
    'status',
    'application_date',
    'actions'
  ];
  
  dataSource = new MatTableDataSource<LoanApplication>();
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  isLoading = false;
  error = '';

  summaryCards: SummaryCard[] = [
    {
      title: 'Applied',
      icon: 'assignment',
      count: 0,
      color: '#2196F3',
      description: 'Applications submitted'
    },
    {
      title: 'Approved',
      icon: 'check_circle',
      count: 0,
      color: '#4CAF50',
      description: 'Applications approved'
    },
    {
      title: 'Funded',
      icon: 'account_balance',
      count: 0,
      color: '#8BC34A',
      description: 'Loans disbursed'
    },
    {
      title: 'Declined',
      icon: 'cancel',
      count: 0,
      color: '#F44336',
      description: 'Applications rejected'
    }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.setupSearch();
    this.setupStatusFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate for complex searching
    this.dataSource.filterPredicate = (data: LoanApplication, filter: string) => {
      const searchStr = [
        data.main_applicant.first_name,
        data.main_applicant.last_name,
        data.main_applicant.email,
        data.status,
        data.security,
        data.amount?.toString()
      ].join(' ').toLowerCase();
      
      return searchStr.includes(filter.toLowerCase());
    };
  }

  loadApplications(status?: string): void {
    this.isLoading = true;
    this.error = '';
    
    this.applicationService.getAllApplications(status).subscribe({
      next: (applications) => {
        this.dataSource.data = applications;
        this.updateSummaryCards(applications);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.error = 'Failed to load applications';
        this.isLoading = false;
        this.snackBar.open('Failed to load applications', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchValue => {
        this.dataSource.filter = searchValue?.trim() || '';
      });
  }

  private setupStatusFilter(): void {
    this.statusFilter.valueChanges.subscribe(status => {
      this.loadApplications(status || undefined);
    });
  }

  private updateSummaryCards(applications: LoanApplication[]): void {
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.summaryCards[0].count = counts['APPLIED'] || 0;
    this.summaryCards[1].count = counts['APPROVED'] || 0;
    this.summaryCards[2].count = counts['FUNDED'] || 0;
    this.summaryCards[3].count = counts['DECLINED'] || 0;
  }

  // Navigation methods
  viewApplication(id: string): void {
    this.router.navigate(['/application', id]);
  }

  editApplication(id: string): void {
    this.router.navigate(['/application', id, 'edit']);
  }

  addNewApplication(): void {
    this.router.navigate(['/add-application']);
  }

  // Utility methods
  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'APPLIED': 'status-applied',
      'APPROVED': 'status-approved', 
      'FUNDED': 'status-funded',
      'DECLINED': 'status-declined'
    };
    return statusClasses[status] || 'status-default';
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
      month: 'short',
      day: 'numeric'
    });
  }

  // Quick search by applicant name
  searchByName(): void {
    const searchValue = this.searchControl.value?.trim();
    if (!searchValue) return;

    const names = searchValue.split(' ');
    if (names.length >= 2) {
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      
      this.applicationService.searchByName(firstName, lastName).subscribe({
        next: (application) => {
          this.dataSource.data = [application];
          this.snackBar.open('Found application', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Search error:', error);
          this.snackBar.open('No application found with that name', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  // Export current filtered data
  exportData(): void {
    const filteredData = this.dataSource.filteredData;
    // This would typically trigger a download or open export dialog
    console.log('Exporting data:', filteredData);
    this.snackBar.open('Export functionality coming soon', 'Close', {
      duration: 3000
    });
  }

  get totalApplications(): number {
    return this.dataSource.data.length;
  }

  get filteredCount(): number {
    return this.dataSource.filteredData.length;
  }
}