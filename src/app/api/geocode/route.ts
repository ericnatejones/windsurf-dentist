import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.[0]) {
      throw new Error('No results found')
    }

    // Return the most accurate address
    return NextResponse.json({
      formatted_address: data.results[0].formatted_address
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    )
  }
}
