export interface Insurance {
  id: string;
  name: string;
  type: string; // e.g., 'PPO', 'HMO'
}

export interface Specialty {
  id: string;
  name: string;
}

export interface DentistPhoto {
  url: string;
  height: number;
  width: number;
}

export interface DentistListing {
  id: string;
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  user_ratings_total: number;
  location: {
    lat: number;
    lng: number;
  };
  photos: DentistPhoto[];
  hours: string[];
  specialties: Specialty[];
  insurances?: Insurance[];
  isClaimed?: boolean;
  isBoosted?: boolean;
  boostTier?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
}
