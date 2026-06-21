import { useQuery } from '@tanstack/react-query';
import { useDI } from '../di/DIContext';

export const nmrcQueryKeys = {
  all: ['nmrc'] as const,
  stations: () => [...nmrcQueryKeys.all, 'stations'] as const,
  journeyPlan: (from: string, to: string) => [...nmrcQueryKeys.all, 'journeyPlan', from, to] as const,
};

export function useNmrcStationsQuery() {
  const { nmrcService } = useDI();
  return useQuery({
    queryKey: nmrcQueryKeys.stations(),
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
    queryKey: nmrcQueryKeys.journeyPlan(fromStationId, toStationId),
    queryFn: () => nmrcService.getJourneyPlan(fromStationId, toStationId),
    enabled: fromStationId.trim().length > 0 && toStationId.trim().length > 0,
  });
}
