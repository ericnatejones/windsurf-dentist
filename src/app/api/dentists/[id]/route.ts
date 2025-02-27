import { NextResponse } from 'next/server'
import { DentistListing } from '@/types/dentist'

interface PlaceDetailsResponse {
  result: {
    name: string
    formatted_address: string
    formatted_phone_number: string
    website?: string
    rating?: number
    user_ratings_total?: number
    photos?: Array<{
      photo_reference: string
      height: number
      width: number
    }>
    opening_hours?: {
      open_now: boolean
      weekday_text?: string[]
    }
    reviews?: Array<{
      author_name: string
      rating: number
      text: string
      time: number
    }>
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    types?: string[]
  }
  status: string
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    // First, get the place details
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,geometry,types&key=${apiKey}`
    )

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch place details')
    }

    const detailsData = await detailsResponse.json() as PlaceDetailsResponse

    if (detailsData.status !== 'OK') {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = detailsData.result
    
    // Transform the data into our format
    const dentist: DentistListing = {
      id: id,
      placeId: id,
      name: place.name,
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      address: place.formatted_address,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      photos: place.photos?.map((photo: any) => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${apiKey}`,
        height: photo.height,
        width: photo.width
      })) || [],
      location: place.geometry?.location || { lat: 0, lng: 0 },
      hours: place.opening_hours?.weekday_text || [],
      specialties: determineSpecialties(place.types || []),
      insurances: [],
      isClaimed: false,
      isBoosted: false,
      opening_hours: place.opening_hours,
      reviews: place.reviews
    }

    return NextResponse.json(dentist)
  } catch (error) {
    console.error('Error fetching dentist details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dentist details' },
      { status: 500 }
    )
  }
}

function determineSpecialties(types: string[]): Array<{ id: string, name: string }> {
  const specialtyMap: { [key: string]: string } = {
    'dentist': 'General Dentistry',
    'orthodontist': 'Orthodontics',
    'periodontist': 'Periodontics',
    'endodontist': 'Endodontics',
    'oral_surgeon': 'Oral Surgery',
    'pediatric_dentist': 'Pediatric Dentistry'
  }

  return types
    .filter(type => specialtyMap[type])
    .map(type => ({
      id: type,
      name: specialtyMap[type]
    }))
}
