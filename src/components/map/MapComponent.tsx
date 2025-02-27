'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { DentistListing } from '@/types/dentist'
import { createClusters } from '@/utils/markerClustering'

const GOOGLE_MAPS_LIBRARIES: ('places' | 'marker')[] = ['places', 'marker']

interface MapComponentProps {
  dentists: DentistListing[]
  selectedDentist: DentistListing | null
  onDentistSelect: (dentist: DentistListing) => void
  onClusterSelect?: (dentists: DentistListing[]) => void
  onClearCluster?: () => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

export function MapComponent({ 
  dentists, 
  selectedDentist, 
  onDentistSelect,
  onClusterSelect,
  onClearCluster 
}: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const [zoom, setZoom] = useState(12)
  const [selectedCluster, setSelectedCluster] = useState<DentistListing[] | null>(null)

  useEffect(() => {
    if (!map || !window.google) return

    // Clean up old markers
    markersRef.current.forEach(marker => marker.map = null)
    markersRef.current = []

    const clusters = createClusters(map, dentists, zoom)

    // Create new markers for each cluster
    const newMarkers = clusters.map((cluster, index) => {
      const markerElement = document.createElement('div')
      const isCluster = cluster.dentists.length > 1

      markerElement.innerHTML = `
        <div class="relative group">
          ${isCluster ? `
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ${cluster.dentists.length} dentists in this area
            </div>
          ` : `
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ${cluster.dentists[0].name}
            </div>
          `}
          <div class="${
            isCluster 
              ? 'bg-blue-500 text-white'
              : selectedDentist?.id === cluster.dentists[0].id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500'
          } w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 font-semibold cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors">
            ${isCluster ? cluster.dentists.length : index + 1}
          </div>
        </div>
      `

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: cluster.center,
        content: markerElement,
      })

      marker.addListener('gmp-click', () => {
        if (isCluster) {
          map.fitBounds(cluster.bounds, 50)
          setSelectedCluster(cluster.dentists)
          onClusterSelect?.(cluster.dentists)
        } else {
          onDentistSelect(cluster.dentists[0])
        }
      })

      return marker
    })

    markersRef.current = newMarkers

    const zoomListener = map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom() || 12
      setZoom(newZoom)
      
      if (newZoom < 12 && selectedCluster) {
        setSelectedCluster(null)
        onClearCluster?.()
      }
    })

    return () => {
      google.maps.event.removeListener(zoomListener)
    }
  }, [map, dentists, zoom, selectedDentist, onDentistSelect, onClusterSelect, onClearCluster])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    markersRef.current.forEach(marker => marker.map = null)
    markersRef.current = []
    setMap(null)
  }, [])

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center">Loading map...</div>

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat: 40.5853, lng: -111.8613 }} // Sandy, Utah
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      />
      {selectedCluster && (
        <button
          onClick={() => {
            if (map) {
              map.setZoom(12)
              setSelectedCluster(null)
              onClearCluster?.()
            }
          }}
          className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg text-blue-600 font-medium z-10 hover:bg-blue-50 transition-colors"
        >
          ← Show All Dentists
        </button>
      )}
    </div>
  )
}
