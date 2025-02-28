import { NextRequest, NextResponse } from 'next/server'
import { GooglePlaceDetails } from '@/types/google-places'
import { DetailedDentist } from '@/types/dentist'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const placeId = (await params).id

    if (!placeId) {
      return NextResponse.json({
        success: false as const,
        error: 'Place ID is required',
        data: null
      })
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
    const url = new URL(baseUrl)
    url.searchParams.append('place_id', placeId)
    url.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')
    url.searchParams.append('fields', [
      'place_id',
      'name',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'rating',
      'reviews',
      'photos',
      'opening_hours',
      'geometry',
      'user_ratings_total'
    ].join(','))

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    const result = data.result as GooglePlaceDetails
    const dentist: DetailedDentist = {
      id: result.place_id,
      placeId: result.place_id,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number || '',
      website: result.website || '',
      rating: result.rating || 0,
      reviewCount: result.reviews?.length || 0,
      user_ratings_total: result.user_ratings_total || 0,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      photos: result.photos?.map(photo => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        height: photo.height,
        width: photo.width
      })) || [],
      hours: result.opening_hours?.weekday_text || [],
      specialties: [],
      insurances: [],
      opening_hours: result.opening_hours,
      reviews: result.reviews
    }

    return NextResponse.json({
      success: true,
      data: {
        dentist
      }
    })
  } catch (error) {
    console.error('Error fetching dentist details:', error)
    return NextResponse.json({
      success: false as const,
      error: 'Failed to fetch dentist details',
      data: null
    })
  }
}
