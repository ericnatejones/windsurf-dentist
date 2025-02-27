'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Libraries } from '@react-google-maps/api'
import { DentistListing } from '@/types/dentist'
import { createClusters } from '@/utils/markerClustering'
import type { AdvancedMarkerElement } from '@/types/google-maps'

interface MapComponentProps {
  dentists: DentistListing[]
  selectedDentist: DentistListing | null
  onDentistSelect: (dentist: DentistListing) => void
  onDentistHover?: (dentist: DentistListing | null) => void
  onClusterSelect?: (dentists: DentistListing[]) => void
  onClearCluster?: () => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 40.5853,
  lng: -111.8613
}

const libraries: Libraries = ['marker']

export function MapComponent({ 
  dentists = [], 
  selectedDentist, 
  onDentistSelect,
  onDentistHover,
  onClusterSelect,
  onClearCluster 
}: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mapIds: [process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || ''],
    libraries
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markersRef = useRef<AdvancedMarkerElement[]>([])
  const [zoom, setZoom] = useState(12)
  const [selectedCluster, setSelectedCluster] = useState<DentistListing[] | null>(null)

  // Handle cluster selection
  const handleClusterClick = useCallback((cluster: DentistListing[]) => {
    setSelectedCluster(cluster)
    onClusterSelect?.(cluster)
  }, [onClusterSelect])

  useEffect(() => {
    if (!map || !dentists || !window.google?.maps?.marker?.AdvancedMarkerElement) return

    // Update markers when dentists or zoom changes
    markersRef.current.forEach(marker => marker.map = null)
    markersRef.current = []

    const clusters = createClusters(map, dentists, zoom)
    clusters.forEach(cluster => {
      const isCluster = !cluster.isNearby && cluster.dentists.length > 1
      
      // Create marker element with proper styling
      const markerElement = document.createElement('div')
      markerElement.className = 'marker-container'
      markerElement.style.cssText = 'position: absolute; transform: translate(-50%, -50%);'
      
      const markerContent = document.createElement('div')
      markerContent.className = `relative group cursor-pointer`
      
      if (isCluster) {
        // Cluster marker
        const markerDot = document.createElement('div')
        markerDot.className = `w-6 h-6 rounded-full flex items-center justify-center shadow-lg 
          bg-blue-500 text-white border-2 border-white text-sm font-semibold transition-transform duration-200`
        markerDot.textContent = cluster.dentists.length.toString()
        markerContent.appendChild(markerDot)
        
        const tooltip = document.createElement('div')
        tooltip.className = 'absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 text-gray-800'
        tooltip.textContent = `${cluster.dentists.length} dentists in this area`
        markerContent.appendChild(tooltip)
      } else {
        // Individual dentist marker
        const markerPin = document.createElement('div')
        markerPin.className = 'relative transition-transform duration-200'
        markerPin.innerHTML = `
          <svg class="w-8 h-8 ${selectedDentist?.id === cluster.dentists[0].id ? 'text-blue-500' : 'text-gray-700'} transition-colors duration-200" 
               viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C7.2 0 3.6 3.6 3.6 8.4c0 7.2 8.4 15.6 8.4 15.6s8.4-8.4 8.4-15.6C20.4 3.6 16.8 0 12 0zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        `
        markerContent.appendChild(markerPin)
        
        const tooltip = document.createElement('div')
        tooltip.className = 'absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 text-gray-800'
        tooltip.textContent = cluster.dentists[0].name
        markerContent.appendChild(tooltip)

        // Add hover listeners for individual dentists
        markerContent.addEventListener('mouseenter', () => {
          markerPin.style.transform = 'scale(1.1)'
          onDentistHover?.(cluster.dentists[0])
        })
        markerContent.addEventListener('mouseleave', () => {
          markerPin.style.transform = 'scale(1)'
          onDentistHover?.(null)
        })
      }
      
      markerElement.appendChild(markerContent)

      const { AdvancedMarkerElement } = google.maps.marker
      const marker = new AdvancedMarkerElement({
        map,
        position: cluster.center,
        content: markerElement,
        title: isCluster ? `${cluster.dentists.length} dentists` : cluster.dentists[0].name
      })

      marker.addListener('gmp-click', () => {
        if (isCluster) {
          map.fitBounds(cluster.bounds, { padding: 50 })
          handleClusterClick(cluster.dentists)
        } else {
          onDentistSelect(cluster.dentists[0])
        }
      })

      markersRef.current.push(marker)
    })

    // Add zoom listener
    const zoomListener = map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom()
      if (newZoom !== undefined) {
        setZoom(newZoom)
        if (selectedCluster && newZoom > 15) {
          onClearCluster?.()
          setSelectedCluster(null)
        }
      }
    })

    return () => {
      markersRef.current.forEach(marker => marker.map = null)
      markersRef.current = []
      google.maps.event.removeListener(zoomListener)
    }
  }, [
    map, 
    dentists, 
    zoom, 
    selectedDentist, 
    selectedCluster,
    onDentistSelect,
    onDentistHover,
    onClusterSelect, 
    onClearCluster,
    handleClusterClick
  ])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    markersRef.current.forEach(marker => marker.map = null)
    markersRef.current = []
    setMap(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedDentist?.location || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
          disableDefaultUI: true,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          }
        }}
      />
      
      {selectedCluster && (
        <button
          onClick={() => {
            map?.setZoom(12)
            map?.setCenter(defaultCenter)
            onClearCluster?.()
            setSelectedCluster(null)
          }}
          className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2 z-10"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
          </svg>
          <span>Back to Overview</span>
        </button>
      )}
    </div>
  )
}
