import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // First, get the place details
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,types,price_level&key=${apiKey}`
    )

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch place details')
    }

    const detailsData = await detailsResponse.json()

    if (detailsData.status !== 'OK') {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = detailsData.result
    
    // Transform the data into our format
    const dentist = {
      id: id,
      name: place.name,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      photos: place.photos?.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${apiKey}`
      ) || [],
      hours: place.opening_hours?.weekday_text || [],
      reviews: place.reviews?.map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        authorPhoto: review.profile_photo_url
      })) || [],
      priceLevel: place.price_level,
      emergencyCare: place.types?.includes('emergency_dentist') || false,
      specialties: determineSpecialties(place.types || [])
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
  const specialtyMap: Record<string, string> = {
    'dentist': 'General Dentistry',
    'emergency_dentist': 'Emergency Care',
    'orthodontist': 'Orthodontics',
    'pediatric_dentist': 'Pediatric Dentistry',
    'cosmetic_dentist': 'Cosmetic Dentistry',
    'oral_surgeon': 'Oral Surgery',
    'endodontist': 'Endodontics',
    'periodontist': 'Periodontics',
    'prosthodontist': 'Prosthodontics'
  }

  return types
    .filter(type => specialtyMap[type])
    .map(type => ({
      id: type,
      name: specialtyMap[type]
    }))
}
