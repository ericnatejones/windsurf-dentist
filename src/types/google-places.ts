// Google Places API Types
export interface GooglePlacePhoto {
  height: number
  html_attributions: string[]
  photo_reference: string
  width: number
}

export interface GooglePlaceOpeningHours {
  open_now: boolean
  weekday_text?: string[]
  periods?: Array<{
    open: {
      day: number
      time: string
      hours: number
      minutes: number
    }
    close: {
      day: number
      time: string
      hours: number
      minutes: number
    }
  }>
}

export interface GooglePlaceReview {
  author_name: string
  author_url?: string
  language: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

export interface GooglePlaceResult {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  reviews?: GooglePlaceReview[]
  photos?: GooglePlacePhoto[]
  opening_hours?: GooglePlaceOpeningHours
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
}

export interface GooglePlacesResponse {
  html_attributions: string[]
  results: GooglePlaceResult[]
  status: string
  next_page_token?: string
}

export interface GooglePlaceDetails extends GooglePlaceResult {
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  url?: string
  utc_offset?: number
  vicinity?: string
  price_level?: number
}

export interface GooglePlaceAutocompleteResult {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
    main_text_matched_substrings: Array<{
      length: number
      offset: number
    }>
  }
  terms: Array<{
    offset: number
    value: string
  }>
  types: string[]
}
