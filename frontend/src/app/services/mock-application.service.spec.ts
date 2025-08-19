import { TestBed } from '@angular/core/testing';

import { MockApplicationService } from './mock-application.service';

describe('MockApplicationService', () => {
  let service: MockApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
