import type { ApiClient } from '../api/client';
import { DmrcService } from '../services/dmrcService';
import { NmrcService } from '../services/nmrcService';

export interface ServiceContainer {
  dmrcService: DmrcService;
  nmrcService: NmrcService;
}

export function createServiceContainer(apiClient: ApiClient): ServiceContainer {
  return {
    dmrcService: new DmrcService(apiClient),
    nmrcService: new NmrcService(apiClient),
  };
}
