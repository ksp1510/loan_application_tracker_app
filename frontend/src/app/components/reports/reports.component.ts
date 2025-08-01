// reports.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reportForm!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  applicationStatuses: string[] = ['APPLIED', 'FUNDED', 'DECLINED'];
  displayedColumns: string[] = ['applicant', 'amount', 'security', 'status', 'application_date'];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  pages = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder,
    private applicationService: ApplicationService,
    private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['']
    });
  }

  applyFilter(): void {
    this.errorMessage = '';
    if (this.reportForm.invalid) {
      this.errorMessage = 'Please select both From and To dates.';
      return;
    }

    const { from, to, status } = this.reportForm.value;
    
    const start = this.datePipe.transform(from, 'yyyy-MM-dd');
    const end = this.datePipe.transform(to, 'yyyy-MM-dd');

    this.isLoading = true;
    this.applicationService.getFilteredApplications(start!, end!, status, this.currentPage, this.pageSize).subscribe({
      next: res => {
        this.filteredData = res.data;
        this.totalItems = res.total;
        this.pages = res.pages;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilter();
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.dataSource.filteredData.map(row => ({
        Applicant: `${row.main_applicant?.first_name} ${row.main_applicant?.last_name}`,
        Amount: row.amount,
        Security: row.security,
        Status: row.status,
        Date: row.application_date
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'loan_report.xlsx');
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'FUNDED': return 'status-funded';
      case 'DECLINED': return 'status-declined';
      default: return 'status-applied';
    }
  }
  

  exportToPDF(): void {
    const doc = new jsPDF();
    const rows = this.dataSource.filteredData.map(row => [
      `${row.main_applicant?.first_name} ${row.main_applicant?.last_name}`,
      row.amount,
      row.security,
      row.status,
      new Date(row.application_date).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [['Applicant', 'Amount', 'Security', 'Status', 'Date']],
      body: rows
    });

    doc.save('loan_report.pdf');
  }
  }
