import { NextResponse } from 'next/server'
import { ApiResponse, ApiErrorResponse } from '@/types/api'

interface GeocodeResponse {
  location: string
}

export async function GET(request: Request): Promise<ApiResponse<GeocodeResponse> | ApiErrorResponse> {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({
      success: false,
      error: 'Missing coordinates',
      data: null
    })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.[0]) {
      return NextResponse.json({
        success: false,
        error: 'No results found',
        data: null
      })
    }

    // Return the most accurate address
    return NextResponse.json({
      success: true,
      data: {
        location: data.results[0].formatted_address
      }
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to geocode location',
      data: null
    })
  }
}
