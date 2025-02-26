'use client'

import SearchBar from '@/components/search/SearchBar'
import { MapComponent } from '@/components/map/MapComponent'
import { DentistList } from '@/components/dentists/DentistList'
import { DentistDetails } from '@/components/dentists/DentistDetails'
import { useState, useEffect, useCallback } from 'react'
import { DentistListing } from '@/types/dentist'

export default function Home() {
  const [selectedDentist, setSelectedDentist] = useState<DentistListing | null>(null)
  const [hoveredDentist, setHoveredDentist] = useState<DentistListing | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<DentistListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLocationLoaded, setInitialLocationLoaded] = useState(false)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isMapHovered, setIsMapHovered] = useState(false)

  const handleSearch = async (location: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dentists/search?location=${encodeURIComponent(location)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setSearchResults(data.dentists)
      setSelectedDentist(null)
      setIsDetailsOpen(false)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only try to get location once
    if (initialLocationLoaded) return

    setInitialLocationLoaded(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Convert coordinates to address using Google's Geocoding API
            const response = await fetch(
              `/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            )
            if (!response.ok) throw new Error('Geocoding failed')
            const { formatted_address } = await response.json()
            handleSearch(formatted_address)
          } catch (error) {
            console.error('Geocoding error:', error)
            // Default to Sandy, Utah if geocoding fails
            handleSearch('Sandy, Utah')
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Default to Sandy, Utah if geolocation is denied or fails
          handleSearch('Sandy, Utah')
        }
      )
    } else {
      // Default to Sandy, Utah if geolocation is not supported
      handleSearch('Sandy, Utah')
    }
  }, [initialLocationLoaded])

  const handleDentistSelect = useCallback((dentist: DentistListing) => {
    setSelectedDentist(dentist)
    setIsDetailsOpen(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="bg-blue-500 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Find a Dentist</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* List and Map Container */}
        <div className={`
          flex-1 flex flex-col lg:flex-row
          ${isDetailsOpen ? 'lg:w-1/2' : 'lg:w-full'}
          transition-all duration-300
        `}>
          {/* List Section */}
          <div className={`
            w-full
            ${isMapHovered ? 'lg:w-1/3' : 'lg:w-1/2'}
            ${isDetailsOpen ? 'hidden lg:block lg:w-1/2' : ''}
            transition-all duration-300
            overflow-auto
          `}>
            <DentistList
              dentists={searchResults}
              onDentistSelect={handleDentistSelect}
              selectedDentistId={selectedDentist?.id}
            />
          </div>

          {/* Map Section */}
          <div
            className={`
              hidden lg:block
              ${isMapHovered ? 'lg:w-2/3' : 'lg:w-1/2'}
              ${isDetailsOpen ? 'lg:w-1/2' : ''}
              transition-all duration-300 ease-in-out
              h-[calc(100vh-200px)]
              relative
            `}
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
          >
            <MapComponent
              dentists={searchResults}
              selectedDentist={selectedDentist}
              onDentistSelect={handleDentistSelect}
            />
          </div>
        </div>

        {/* Details Panel */}
        <div className={`
          ${isDetailsOpen ? 'lg:w-1/2' : 'lg:w-0'}
          transition-all duration-300
          overflow-hidden
        `}>
          <DentistDetails
            dentist={selectedDentist}
            isOpen={isDetailsOpen}
            onClose={handleCloseDetails}
          />
        </div>
      </main>
    </div>
  )
}
