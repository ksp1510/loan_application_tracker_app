import { ApplicationService } from './application.service';
import { MockApplicationService } from './mock-application.service';
import { environment } from '../../environments/environment';

export function createApplicationService() {
  return environment.useMockService ? MockApplicationService : ApplicationService;
}