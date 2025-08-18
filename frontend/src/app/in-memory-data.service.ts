import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    // Mock applications dataset (simplified from your Applicants.applications.json)
    const applications = [
      {
        id: '675bc2df9187162ead8e73cb',
        amount: 20000,
        notes: "High-income borrower with co-applicant",
        reason: "Home renovation",
        security: "Vehicle",
        status: "FUNDED",
        main_applicant: {
          first_name: "Robert",
          last_name: "Smith",
          email: "robert.smith@example.com",
          cell_phone: "403-555-7890",
          province: "AB"
        },
        co_applicant: {
          first_name: "Emily",
          last_name: "Smith",
          email: "emily.smith@example.com"
        }
      },
      {
        id: '675bc8a2e603ea229f013d20',
        amount: 18000,
        notes: "Too many existing loans",
        reason: "Debt consolidation",
        security: "Vehicle",
        status: "DECLINED",
        main_applicant: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          cell_phone: "416-123-4567",
          province: "ON"
        },
        co_applicant: {
          first_name: "Jane",
          last_name: "Doe",
          email: "jane.doe@example.com"
        }
      },
      {
        id: '675bc2c69187162ead8e73ca',
        amount: 12000,
        notes: "Waiting for document submission",
        reason: "Medical bills",
        security: "Vehicle",
        status: "PENDING",
        main_applicant: {
          first_name: "Alice",
          last_name: "Johnson",
          email: "alice.johnson@example.com",
          cell_phone: "604-555-6789",
          province: "BC"
        },
        co_applicant: null
      },
      {
        id: '688b99d7f0b636b7d1542f60',
        amount: 15000,
        notes: "First-time applicant.",
        reason: "Car repair and urgent expenses",
        security: "Vehicle",
        status: "APPLIED",
        main_applicant: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          cell_phone: "416-555-1234",
          province: "ON"
        },
        co_applicant: null
      },
      {
        id: '689cd08e1318d42ff918869c',
        amount: 30000,
        notes: "Updated approved amount after income verification and credit check.",
        reason: "Home Renovation - Extended Budget",
        security: "Vehicle",
        status: "APPROVED",
        main_applicant: {
          first_name: "Priya",
          last_name: "Sharma",
          email: "priya.sharma@example.com",
          cell_phone: "647-555-2134",
          province: "ON"
        },
        co_applicant: {
          first_name: "Priya",
          last_name: "Sharma",
          email: "priya.sharma@example.com"
        }
      }
    ];

    // Compute summary stats dynamically
    const totalApplications = applications.length;
    const totalAmount = applications.reduce((sum, app) => sum + app.amount, 0);
    const avgAmount = totalApplications > 0 ? totalAmount / totalApplications : 0;

    const statusBreakdown: Record<string, number> = {};
    applications.forEach(app => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
    });

    const summaryStats = {
      totalApplications,
      totalAmount,
      avgAmount,
      statusBreakdown
    };

    return { applications, summaryStats };
  }
}
