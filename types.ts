
export interface TripDetails {
  destination: string;
  startDate: string;
  endDate: string;
  members: string;
  mustVisit: string;
  accommodation: string;
  preferences: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export type ActivityType = 'sightseeing' | 'food' | 'transport' | 'shopping' | 'rest' | 'other';

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface Activity {
  id?: string; // For react keys
  time: string;
  title: string;
  description: string;
  type: ActivityType;
  location?: GeoLocation;
  transportDetail?: string; // Description of movement
  cost?: string;
  localTip?: string; // The "Expert/Local" advice
  duration?: string;
  bookingRequired?: boolean;
  rainPlan?: string; // Fallback for this specific slot
}

export interface DayPlan {
  day: number;
  date: string; // YYYY-MM-DD or display string
  theme: string; // e.g., "Historical Kyoto"
  summary: string;
  activities: Activity[];
}

export type VisualVibe = 'modern' | 'historical' | 'nature' | 'tropical';

export interface TripPlan {
  tripTitle: string;
  destination: string;
  duration: string;
  totalBudgetEstimate: string;
  visualVibe: VisualVibe; // New field for UI theming
  days: DayPlan[];
  generalTips: string[]; // Cultural taboos, packing tips
}

export interface ItineraryResponse {
  plan: TripPlan;
  groundingChunks?: GroundingChunk[];
}

export interface SavedTrip {
  id: string;
  timestamp: number;
  details: TripDetails;
  response: ItineraryResponse;
}