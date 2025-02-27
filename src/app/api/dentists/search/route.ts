import { NextRequest, NextResponse } from 'next/server'
import { GooglePlaceResult, GooglePlacesResponse } from '@/types/google-places'
import { DentistListing, DentistSearchResponse } from '@/types/dentist'
import { ApiResponse, ApiErrorResponse } from '@/types/api'

export async function GET(
  request: NextRequest
): Promise<ApiResponse<DentistSearchResponse> | ApiErrorResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const pageToken = searchParams.get('pageToken')

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'Location parameter is required',
        data: null
      })
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    const query = `${location} dentist`
    
    const url = new URL(baseUrl)
    url.searchParams.append('query', query)
    url.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')
    if (pageToken) {
      url.searchParams.append('pagetoken', pageToken)
    }

    const response = await fetch(url.toString())
    const data = (await response.json()) as GooglePlacesResponse

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    const dentists: DentistListing[] = data.results.map((result: GooglePlaceResult) => ({
      id: result.place_id,
      placeId: result.place_id,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number || '',
      website: result.website || '',
      rating: result.rating || 0,
      reviewCount: result.user_ratings_total || 0,
      user_ratings_total: result.user_ratings_total || 0,
      location: result.geometry.location,
      photos: (result.photos || []).map(photo => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        height: photo.height,
        width: photo.width
      })),
      hours: result.opening_hours?.weekday_text || [],
      specialties: [],
      opening_hours: result.opening_hours,
      insurances: []
    }))

    return NextResponse.json({
      success: true,
      data: {
        dentists,
        nextPageToken: data.next_page_token
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search for dentists',
      data: null
    })
  }
}
