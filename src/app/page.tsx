'use client'

import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
// import { FilterButtons } from '@/components/search/FilterButtons'
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
    setSelectedDentist(null)
    setIsDetailsOpen(false)
  }, [])

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header with white background */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-3xl site-header text-primary-blue">Dentist Sherpa</h1>
          <div className="text-right">
            <p className="text-sm font-medium text-primary-blue">Get more leads</p>
            <p className="text-sm font-medium text-primary-blue">for your Practice</p>
          </div>
        </div>
      </div>

      {/* Hero Section with Search */}
      <div className="hero-section py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-6xl find-dentist-heading mb-8">Find a Dentist</h2>
            <SearchBar onSearch={handleSearch} />
            <div className="mt-4 flex justify-between">
              <div className="flex gap-3">
                <button className="filter-button">
                  <span>Insurance</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
                <button className="filter-button">
                  <span>Specialty</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
              </div>
              <div>
                <button
                  onClick={() => {}}
                  className="filter-button"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>All Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - List */}
          <div className="w-full lg:w-1/2 xl:w-2/5">
            <div className="lg:hidden mb-4">
              <MobileMapCard
                dentists={searchResults}
                selectedDentist={selectedDentist}
                onDentistSelect={handleDentistSelect}
                onClusterSelect={handleClusterSelect}
              />
            </div>
            <DentistList 
              dentists={searchResults}
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
                  dentists={searchResults}
                  selectedDentist={selectedDentist}
                  hoveredDentist={hoveredDentist}
                  onDentistSelect={handleDentistSelect}
                  onDentistHover={setHoveredDentist}
                  onClusterSelect={handleClusterSelect}
                  onClearCluster={() => {}}
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
