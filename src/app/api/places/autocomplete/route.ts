import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  
  if (!input) {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=(cities)&components=country:us&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API')
    }

    const data = await response.json()
    
    if (data.status === 'OK') {
      return NextResponse.json({
        predictions: data.predictions.map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          structured_formatting: {
            main_text: prediction.structured_formatting.main_text,
            secondary_text: prediction.structured_formatting.secondary_text
          }
        }))
      })
    } else {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}
