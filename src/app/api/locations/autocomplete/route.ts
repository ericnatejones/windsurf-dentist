import { NextResponse } from 'next/server'

interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface AutocompleteResponse {
  predictions: PlacePrediction[]
  status: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  
  if (!input) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(input)}` +
      `&types=(cities)` +
      `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch predictions')
    }

    const data = await response.json() as AutocompleteResponse
    
    return NextResponse.json({
      predictions: data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id
      }))
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ predictions: [] })
  }
}
