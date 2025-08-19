// services/service-switcher.ts
// Utility to easily switch between mock and real services

import { Injectable, inject } from '@angular/core';
import { ApplicationService } from './application.service';
import { MockApplicationService } from './mock-application.service';

export interface ServiceConfig {
  useMockService: boolean;
  apiUrl: string;
  mockDataCount: number;
}

@Injectable({ providedIn: 'root' })
export class ServiceSwitcher {
  private config: ServiceConfig = {
    useMockService: true, // 👈 Change this to switch services
    apiUrl: 'http://localhost:8000',
    mockDataCount: 8
  };

  getApplicationService() {
    if (this.config.useMockService) {
      console.log('🎯 Using Mock Application Service');
      return inject(MockApplicationService);
    } else {
      console.log('🌐 Using Real Application Service');
      return inject(ApplicationService);
    }
  }

  getCurrentConfig(): ServiceConfig {
    return { ...this.config };
  }

  switchToMock(): void {
    this.config.useMockService = true;
    console.log('🔄 Switched to Mock Service');
    // In a real app, you might need to reload or emit an event
  }

  switchToReal(): void {
    this.config.useMockService = false;
    console.log('🔄 Switched to Real Service');
  }

  isMockMode(): boolean {
    return this.config.useMockService;
  }
}

// Usage in components:
// constructor(private serviceSwitcher: ServiceSwitcher) {
//   this.applicationService = this.serviceSwitcher.getApplicationService();
// }