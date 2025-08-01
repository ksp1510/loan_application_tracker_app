// dashboard.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApplicationService } from '../../services/application.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['applicant', 'amount', 'security', 'status', 'application_date', 'actions'];
  dataSource = new MatTableDataSource<any>();
  stats = { funded: 0, pending: 0, declined: 0 };
  summaryCards = [
    { title: 'Funded', icon: 'check_circle', count: 0, color: 'green' },
    { title: 'Pending', icon: 'hourglass_empty', count: 0, color: 'orange' },
    { title: 'Declined', icon: 'cancel', count: 0, color: 'red' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private appService: ApplicationService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.appService.getAllApplications().subscribe(apps => {
      this.dataSource.data = apps;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.updateStats(apps);
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'FUNDED': return 'green';
      case 'DECLINED': return 'red';
      default: return 'orange';
    }
  }

  updateStats(apps: any[]): void {
    const funded = apps.filter(a => a.status === 'FUNDED').length;
    const pending = apps.filter(a => a.status === 'APPLIED').length;
    const declined = apps.filter(a => a.status === 'DECLINED').length;

    this.stats = { funded, pending, declined };

    this.summaryCards[0].count = funded;
    this.summaryCards[1].count = pending;
    this.summaryCards[2].count = declined;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewApplication(id: string): void {
    this.router.navigate(['/application-details', id]);
  }

  editApplication(id: string): void {
    this.router.navigate(['/edit-application', id]);
  }

  get totalItems(): number {
    return this.dataSource.data.length;
  }
}
