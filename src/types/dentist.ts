export interface Insurance {
  id: string;
  name: string;
  type: string; // e.g., 'PPO', 'HMO'
}

export interface Specialty {
  id: string;
  name: string;
}

export interface DentistListing {
  id: string;
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  rating: number;
  reviewCount: number;
  photos?: string[];
  location: {
    lat: number;
    lng: number;
  };
  openingHours?: {
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
  specialties: Specialty[];
  insurances: Insurance[];
  isClaimed: boolean;
  isBoosted: boolean;
  boostTier?: number;
}
