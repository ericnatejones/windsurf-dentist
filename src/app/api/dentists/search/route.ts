import { NextResponse } from 'next/server'
import { DentistListing } from '@/types/dentist'

interface PlaceSearchResponse {
  results: Array<{
    place_id: string
    name: string
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    rating?: number
    user_ratings_total?: number
    photos?: Array<{
      photo_reference: string
      height: number
      width: number
    }>
    opening_hours?: {
      open_now: boolean
    }
  }>
  status: string
}

interface PlaceDetailsResponse {
  result: {
    name: string
    formatted_address: string
    formatted_phone_number: string
    website: string
    rating: number
    user_ratings_total: number
    opening_hours: {
      weekday_text: Array<string>
    }
    photos: Array<{
      photo_reference: string
      height: number
      width: number
    }>
  }
  status: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')
  
  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Missing API key in environment')
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
    }

    // First, geocode the location to get coordinates
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        location
      )}&key=${apiKey}`
    )
    const geocodeData = await geocodeResponse.json()

    if (!geocodeData.results?.[0]?.geometry?.location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { lat, lng } = geocodeData.results[0].geometry.location

    // Then, search for dentists near that location
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=dentist&key=${apiKey}`
    )
    const placesData = await placesResponse.json() as PlaceSearchResponse

    if (!placesData.results || placesData.status !== 'OK') {
      return NextResponse.json({ 
        error: 'No dentists found in this area',
        details: placesData.status 
      }, { status: 404 })
    }

    // Transform the places data into our DentistListing format
    const dentists: DentistListing[] = await Promise.all(
      placesData.results.map(async (place) => {
        try {
          // Get place details for additional information
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
              place.place_id
            }&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos&key=${apiKey}`
          )
          const detailsData = await detailsResponse.json() as PlaceDetailsResponse
          
          if (detailsData.status !== 'OK') {
            throw new Error(`Place details failed: ${detailsData.status}`)
          }

          const details = detailsData.result
          const photos = details?.photos?.map((photo) => ({
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${apiKey}`,
            height: photo.height,
            width: photo.width
          })) || []

          return {
            id: place.place_id,
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: details?.formatted_phone_number || '',
            website: details?.website || '',
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            user_ratings_total: place.user_ratings_total || 0,
            location: place.geometry.location,
            photos: photos,
            hours: details?.opening_hours?.weekday_text || [],
            specialties: [],
            insurances: [],
            isClaimed: false,
            isBoosted: false,
            opening_hours: place.opening_hours
          }
        } catch (error) {
          console.error(`Error fetching details for ${place.place_id}:`, error)
          // Return basic info if details fetch fails
          return {
            id: place.place_id,
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: '',
            website: '',
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            user_ratings_total: place.user_ratings_total || 0,
            location: place.geometry.location,
            photos: [],
            hours: [],
            specialties: [],
            insurances: [],
            isClaimed: false,
            isBoosted: false,
            opening_hours: place.opening_hours
          }
        }
      })
    )

    return NextResponse.json({ dentists })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Search failed',
        details: 'Internal server error'
      }, 
      { status: 500 }
    )
  }
}
