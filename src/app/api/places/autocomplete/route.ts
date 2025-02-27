import { NextResponse } from 'next/server'

interface GooglePlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')
    
    if (!input) {
      return NextResponse.json({
        success: false,
        error: 'Input is required',
        predictions: []
      })
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'
    const url = new URL(baseUrl)
    url.searchParams.append('input', input)
    url.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')
    url.searchParams.append('types', 'establishment')
    url.searchParams.append('strictbounds', 'true')

    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status === 'OK') {
      return NextResponse.json({
        predictions: data.predictions.map((prediction: GooglePlacePrediction) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          structured_formatting: {
            main_text: prediction.structured_formatting.main_text,
            secondary_text: prediction.structured_formatting.secondary_text
          }
        }))
      })
    }

    return NextResponse.json({
      success: false,
      error: data.error_message || 'Failed to fetch predictions',
      predictions: []
    })
  } catch (error) {
    console.error('Error in autocomplete:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch predictions',
      predictions: []
    })
  }
}
