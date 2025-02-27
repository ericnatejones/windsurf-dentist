import { GooglePlaceOpeningHours, GooglePlaceReview } from './google-places'

export interface Insurance {
  id: string
  name: string
  type: string // e.g., 'PPO', 'HMO'
}

export interface Specialty {
  id: string
  name: string
}

export interface DentistPhoto {
  url: string
  height: number
  width: number
}

export interface DentistLocation {
  lat: number
  lng: number
}

export interface DentistListing {
  id: string
  placeId: string
  name: string
  address: string
  phone: string
  website: string
  rating: number
  reviewCount: number
  user_ratings_total: number
  location: DentistLocation
  photos: DentistPhoto[]
  hours: string[]
  specialties: Specialty[]
  insurances?: Insurance[]
  isClaimed?: boolean
  isBoosted?: boolean
  boostTier?: number
  opening_hours?: GooglePlaceOpeningHours
}

export interface DetailedDentist extends DentistListing {
  reviews?: GooglePlaceReview[]
}

export interface DentistCluster {
  center: DentistLocation
  bounds: google.maps.LatLngBounds
  dentists: DentistListing[]
}

// API Response Types
export interface DentistSearchResponse {
  dentists: DentistListing[]
  nextPageToken?: string
}

export interface DentistDetailsResponse {
  dentist: DetailedDentist
}
