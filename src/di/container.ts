import type { ApiClient } from '../api/client';
import { DmrcService } from '../services/dmrcService';
import { NmrcService } from '../services/nmrcService';
import { MapService } from '../services/mapService';

export interface ServiceContainer {
  dmrcService: DmrcService;
  nmrcService: NmrcService;
  mapService: MapService;
}

export function createServiceContainer(apiClient: ApiClient): ServiceContainer {
  return {
    dmrcService: new DmrcService(apiClient),
    nmrcService: new NmrcService(apiClient),
    mapService: new MapService(apiClient),
  };
}
