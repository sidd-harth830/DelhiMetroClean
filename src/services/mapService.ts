import type { ApiClient } from '../api/client';
import type {
  MapAsset,
  MapAssetByFormatResponse,
  MapAssetListResponse,
  MapFamily,
  MapFormat,
} from '../types';

/**
 * MapService — now a class injected via DI (same pattern as DmrcService/NmrcService).
 * This ensures the API key auth header is included in all map requests.
 */
export class MapService {
  constructor(private readonly apiClient: ApiClient) {}

  getAllAssets(): Promise<MapAssetListResponse> {
    return this.apiClient.get<MapAssetListResponse>('/dmrc/maps/assets');
  }

  getFamilyAssets(family: MapFamily, format: MapFormat = 'any'): Promise<MapAssetListResponse> {
    return this.apiClient.get<MapAssetListResponse>(`/dmrc/maps/${family}/assets`, {
      query: { format },
    });
  }

  getFamilyPrimaryMaps(family: MapFamily): Promise<MapAssetByFormatResponse> {
    return this.apiClient.get<MapAssetByFormatResponse>(`/dmrc/maps/${family}`);
  }

  getAssetById(assetId: string): Promise<MapAsset> {
    return this.apiClient.get<MapAsset>(`/dmrc/maps/assets/${assetId}`);
  }

  getDownloadUrl(family: MapFamily, format: MapFormat = 'any'): string {
    const query = new URLSearchParams({ format }).toString();
    return `${this.apiClient.baseUrl}/dmrc/maps/${family}/download?${query}`;
  }

  getProxyFileUrl(family: MapFamily, format: MapFormat = 'any'): string {
    const query = new URLSearchParams({ format }).toString();
    return `${this.apiClient.baseUrl}/dmrc/maps/${family}/file?${query}`;
  }
}
