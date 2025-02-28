'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Libraries } from '@react-google-maps/api'
import { DentistListing } from '@/types/dentist'
import { createClusters } from '@/utils/markerClustering'
import type { AdvancedMarkerElement } from '@/types/google-maps'

interface MapComponentProps {
  dentists: DentistListing[]
  selectedDentist: DentistListing | null
  hoveredDentist: DentistListing | null
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
  hoveredDentist,
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
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)
  const [clusterLevel, setClusterLevel] = useState(1)

  // Handle cluster selection
  const handleClusterClick = useCallback((cluster: DentistListing[], clusterId: string, canZoomIn: boolean) => {
    setSelectedCluster(cluster)
    
    if (canZoomIn) {
      // If this cluster can be zoomed in further, store its ID for subclustering
      setSelectedClusterId(clusterId)
      setClusterLevel(prev => prev + 1)
    } else {
      // If this is a leaf cluster or individual dentist, clear the cluster ID
      setSelectedClusterId(null)
    }
    
    onClusterSelect?.(cluster)
  }, [onClusterSelect])

  useEffect(() => {
    if (!map || !dentists || !window.google?.maps?.marker?.AdvancedMarkerElement) return

    // Update markers when dentists or zoom changes
    markersRef.current.forEach(marker => marker.map = null)
    markersRef.current = []

    const clusters = createClusters(map, dentists, zoom, selectedClusterId || undefined, clusterLevel)
    
    // Process all clusters at once instead of using forEach
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]
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
        
        // Add a small indicator if the cluster can be zoomed in further
        if (cluster.canZoomIn) {
          markerDot.innerHTML = `
            <span>${cluster.dentists.length}</span>
            <span class="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
          `
        } else {
          markerDot.textContent = cluster.dentists.length.toString()
        }
        
        markerContent.appendChild(markerDot)
        
        const tooltip = document.createElement('div')
        tooltip.className = 'absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 text-gray-800'
        
        if (cluster.canZoomIn) {
          tooltip.textContent = `${cluster.dentists.length} dentists in this area (click to zoom in)`
        } else {
          tooltip.textContent = `${cluster.dentists.length} dentists in this area`
        }
        
        markerContent.appendChild(tooltip)
      } else {
        // Individual dentist marker
        const markerPin = document.createElement('div')
        markerPin.className = 'relative'
        markerPin.innerHTML = `
          <svg class="w-8 h-8 ${
            selectedDentist?.id === cluster.dentists[0].id 
              ? 'text-blue-500' 
              : hoveredDentist?.id === cluster.dentists[0].id 
                ? 'text-blue-400' 
                : 'text-gray-700'
          }" 
               viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C7.2 0 3.6 3.6 3.6 8.4c0 7.2 8.4 15.6 8.4 15.6s8.4-8.4 8.4-15.6C20.4 3.6 16.8 0 12 0zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        `
        markerContent.appendChild(markerPin)
        
        const dentist = cluster.dentists[0]
        const tooltip = document.createElement('div')
        tooltip.className = 'absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10'
        tooltip.innerHTML = `
          <div class="bg-white rounded-lg shadow-lg overflow-hidden w-64">
            <div class="flex">
              ${dentist.photos && dentist.photos.length > 0 ? 
                `<div class="w-1/3">
                  <img src="${dentist.photos[0].url}" alt="${dentist.name}" class="h-full w-full object-cover" />
                </div>` : ''}
              <div class="p-3 ${dentist.photos && dentist.photos.length > 0 ? 'w-2/3' : 'w-full'}">
                <h3 class="font-semibold text-gray-800 text-sm truncate">${dentist.name}</h3>
                <div class="flex items-center mt-1">
                  <span class="text-yellow-500">★</span>
                  <span class="text-xs text-gray-600 ml-1">${dentist.rating.toFixed(1)}</span>
                  <span class="text-xs text-gray-500 ml-1">(${dentist.reviewCount})</span>
                </div>
                <div class="text-xs text-gray-600 mt-1">
                  ${dentist.opening_hours?.open_now ? 
                    '<span class="text-green-600">Open</span>' : 
                    '<span class="text-gray-500">Closed</span>'} · 
                  ${dentist.opening_hours?.weekday_text ? 
                    `Opens ${dentist.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].split(': ')[1].split('–')[0].trim()}` : 
                    'Hours N/A'}
                </div>
              </div>
            </div>
          </div>
        `
        markerContent.appendChild(tooltip)

        // Add hover listeners for individual dentists without scaling
        markerContent.addEventListener('mouseenter', () => {
          onDentistHover?.(cluster.dentists[0])
        })
        markerContent.addEventListener('mouseleave', () => {
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
          // Calculate padding based on the cluster size
          const padding = Math.min(100, 50 + cluster.dentists.length * 2)
          
          map.fitBounds(cluster.bounds, { 
            top: padding, 
            right: padding, 
            bottom: padding, 
            left: padding 
          })
          
          handleClusterClick(cluster.dentists, cluster.id, cluster.canZoomIn)
        } else {
          onDentistSelect(cluster.dentists[0])
        }
      })

      markersRef.current.push(marker)
    }

    // Add zoom listener
    const zoomListener = map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom()
      if (newZoom !== undefined) {
        setZoom(newZoom)
        if (selectedCluster && newZoom > 15) {
          onClearCluster?.()
          setSelectedCluster(null)
          setSelectedClusterId(null)
          setClusterLevel(1)
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
    hoveredDentist,
    selectedCluster,
    selectedClusterId,
    clusterLevel,
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
            setZoom(12)
            map?.setZoom(12)
            map?.setCenter(defaultCenter)
            onClearCluster?.()
            setSelectedCluster(null)
            setSelectedClusterId(null)
            setClusterLevel(1)
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
