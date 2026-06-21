export interface NmrcStation {
  id: string;
  name: string;
}

export interface NmrcJourneyPlan {
  source: string;
  destination: string;
  fare: string;
  concessionalFare: string;
  stations: number;
  time: string;
}
