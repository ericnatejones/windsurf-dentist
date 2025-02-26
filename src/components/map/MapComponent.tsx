'use client'

import { useEffect, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { DentistListing } from '@/types/dentist'

const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places']

interface MapComponentProps {
  selectedDentist: DentistListing | null;
  dentists: DentistListing[];
  onDentistSelect?: (dentist: DentistListing) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

export function MapComponent({ selectedDentist, dentists, onDentistSelect }: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState({
    lat: 40.7128,
    lng: -74.0060
  })

  useEffect(() => {
    if (selectedDentist && selectedDentist.location && map) {
      map.panTo(selectedDentist.location)
      map.setZoom(15)
    }
  }, [selectedDentist, map])

  useEffect(() => {
    if (dentists.length > 0 && dentists[0].location) {
      setCenter(dentists[0].location)
    }
  }, [dentists])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (!isLoaded) return <div>Loading...</div>

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      }}
    >
      {dentists.map((dentist) => (
        <MarkerF
          key={dentist.id}
          position={dentist.location}
          onClick={() => onDentistSelect?.(dentist)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: selectedDentist?.id === dentist.id ? '#2563EB' : '#60A5FA',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  )
}
