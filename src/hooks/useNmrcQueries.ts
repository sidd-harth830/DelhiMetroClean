import { useQuery } from '@tanstack/react-query';
import { useDI } from '../di/DIContext';

import { queryKeys } from './queryKeys';

export function useNmrcStationsQuery() {
  const { nmrcService } = useDI();
  return useQuery({
    queryKey: queryKeys.nmrcStations,
    queryFn: () => nmrcService.getStations(),
    staleTime: Infinity,
  });
}

export function useNmrcJourneyPlanQuery(
  fromStationId: string,
  toStationId: string,
) {
  const { nmrcService } = useDI();
  return useQuery({
    queryKey: queryKeys.nmrcJourneyPlan(fromStationId, toStationId),
    queryFn: () => nmrcService.getJourneyPlan(fromStationId, toStationId),
    enabled: fromStationId.trim().length > 0 && toStationId.trim().length > 0,
  });
}
