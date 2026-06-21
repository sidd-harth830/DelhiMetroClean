import type { ApiClient } from '../api/client';
import type { NmrcJourneyPlan, NmrcStation } from '../types';

export class NmrcService {
  constructor(private readonly apiClient: ApiClient) {}

  getStations(): Promise<NmrcStation[]> {
    return this.apiClient.get<NmrcStation[]>('/nmrc/stations');
  }

  getJourneyPlan(
    fromStationId: string,
    toStationId: string,
  ): Promise<NmrcJourneyPlan> {
    return this.apiClient.get<NmrcJourneyPlan>('/nmrc/journeys/plan', {
      query: {
        from: fromStationId,
        to: toStationId,
      },
    });
  }
}
