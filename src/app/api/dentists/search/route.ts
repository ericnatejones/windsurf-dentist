import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')
  
  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 })
  }

  try {
    // First, geocode the location to get coordinates
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        location
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    )
    const geocodeData = await geocodeResponse.json()

    if (!geocodeData.results?.[0]?.geometry?.location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { lat, lng } = geocodeData.results[0].geometry.location

    // Then, search for dentists near that location
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=dentist&key=${process.env.GOOGLE_MAPS_API_KEY}`
    )
    const placesData = await placesResponse.json()

    // Transform the places data into our DentistListing format
    const dentists = await Promise.all(
      placesData.results.map(async (place: any) => {
        // Get place details for additional information
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
            place.place_id
          }&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos&key=${
            process.env.GOOGLE_MAPS_API_KEY
          }`
        )
        const detailsData = await detailsResponse.json()
        const details = detailsData.result

        return {
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity,
          phone: details?.formatted_phone_number || '',
          website: details?.website,
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          photos: place.photos
            ? place.photos.map(
                (photo: any) =>
                  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
              )
            : [],
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          openingHours: details?.opening_hours,
          specialties: [], // This will be populated from our database
          insurances: [], // This will be populated from our database
          isClaimed: false,
          isBoosted: false,
        }
      })
    )

    return NextResponse.json({ dentists })
  } catch (error) {
    console.error('Error searching for dentists:', error)
    return NextResponse.json(
      { error: 'Failed to search for dentists' },
      { status: 500 }
    )
  }
}
