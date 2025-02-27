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
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Geocoding error:', errorData);
      return NextResponse.json({ error: 'Geocoding request failed', details: errorData }, { status: response.status });
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.[0]) {
      console.error('Geocoding error: No results found', data);
      return NextResponse.json({ error: 'No results found', status: data.status }, { status: 404 });
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
