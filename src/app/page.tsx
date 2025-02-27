'use client'

import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { DentistList } from '@/components/dentists/DentistList'
import { MapComponent } from '@/components/map/MapComponent'
import { DentistDetails } from '@/components/dentists/DentistDetails'
import { DentistListing } from '@/types/dentist'
import { MobileMapCard } from '@/components/map/MobileMapCard'

export default function Home() {
  const [selectedDentist, setSelectedDentist] = useState<DentistListing | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<DentistListing[]>([])
  const [initialLocationLoaded, setInitialLocationLoaded] = useState(false)
  const [filteredDentists, setFilteredDentists] = useState<DentistListing[]>([])
  const [hoveredDentist, setHoveredDentist] = useState<DentistListing | null>(null)

  useEffect(() => {
    // Get user's location on initial load
    if (!initialLocationLoaded) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
              )
              if (!response.ok) throw new Error('Geocoding failed')
              const data = await response.json()
              if (data.success && data.data.location) {
                handleSearch(data.data.location)
              }
            } catch (error) {
              console.error('Error getting initial location:', error)
              // Fallback to a default location
              handleSearch('Sandy, UT, USA')
            } finally {
              setInitialLocationLoaded(true)
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
            // Fallback to a default location
            handleSearch('Sandy, UT, USA')
            setInitialLocationLoaded(true)
          }
        )
      } else {
        // Fallback for browsers without geolocation
        handleSearch('Sandy, UT, USA')
        setInitialLocationLoaded(true)
      }
    }
  }, [initialLocationLoaded])

  const handleSearch = async (location: string) => {
    try {
      console.log('Searching for dentists at:', location)
      const response = await fetch(`/api/dentists/search?location=${encodeURIComponent(location)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      if (data.success) {
        console.log('Found dentists:', data.data.dentists.length)
        setSearchResults(data.data.dentists)
        setSelectedDentist(null)
        setIsDetailsOpen(false)
        setFilteredDentists([])
      } else {
        console.error('Search error:', data.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }

  const handleDentistSelect = useCallback((dentist: DentistListing) => {
    setSelectedDentist(dentist)
    setIsDetailsOpen(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false)
  }, [])

  const handleClusterSelect = useCallback((dentists: DentistListing[]) => {
    setFilteredDentists(dentists)
    setSelectedDentist(null)
    setIsDetailsOpen(false)
  }, [])

  // Get the current dentists to display
  const currentDentists = filteredDentists.length > 0 ? filteredDentists : searchResults

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Find a Dentist</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - List */}
          <div className="w-full lg:w-1/2 xl:w-2/5">
            <div className="lg:hidden mb-4">
              <MobileMapCard
                dentists={currentDentists}
                selectedDentist={selectedDentist}
                onDentistSelect={handleDentistSelect}
                onClusterSelect={handleClusterSelect}
              />
            </div>
            <DentistList 
              dentists={currentDentists}
              selectedDentistId={selectedDentist?.id}
              hoveredDentist={hoveredDentist}
              onDentistSelect={handleDentistSelect}
            />
          </div>

          {/* Right Column - Map */}
          <div className="w-full lg:w-1/2 xl:w-3/5 relative">
            <div className="sticky top-4">
              <div className="hidden lg:block h-[calc(100vh-8rem)] rounded-lg overflow-hidden">
                <MapComponent
                  dentists={currentDentists}
                  selectedDentist={selectedDentist}
                  hoveredDentist={hoveredDentist}
                  onDentistSelect={handleDentistSelect}
                  onDentistHover={setHoveredDentist}
                  onClusterSelect={handleClusterSelect}
                  onClearCluster={() => setFilteredDentists([])}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <DentistDetails
        dentist={selectedDentist}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </main>
  )
}
