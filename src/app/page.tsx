'use client'

import SearchBar from '@/components/search/SearchBar'
import { MapComponent } from '@/components/map/MapComponent'
import { DentistList } from '@/components/dentists/DentistList'
import { DentistDetails } from '@/components/dentists/DentistDetails'
import { MobileMapCard } from '@/components/map/MobileMapCard'
import { useState, useEffect, useCallback } from 'react'
import { DentistListing } from '@/types/dentist'

export default function Home() {
  const [selectedDentist, setSelectedDentist] = useState<DentistListing | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<DentistListing[]>([])
  const [initialLocationLoaded, setInitialLocationLoaded] = useState(false)
  const [filteredDentists, setFilteredDentists] = useState<DentistListing[] | null>(null)

  const handleSearch = async (location: string) => {
    try {
      const response = await fetch(`/api/dentists/search?location=${encodeURIComponent(location)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setSearchResults(data.dentists)
      setSelectedDentist(null)
      setIsDetailsOpen(false)
      setFilteredDentists(null)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }

  const handleClusterSelect = useCallback((dentists: DentistListing[]) => {
    setFilteredDentists(dentists)
    setSelectedDentist(null)
    setIsDetailsOpen(false)
  }, [])

  const handleClearCluster = useCallback(() => {
    setFilteredDentists(null)
    setSelectedDentist(null)
    setIsDetailsOpen(false)
  }, [])

  useEffect(() => {
    if (initialLocationLoaded) return
    setInitialLocationLoaded(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            )
            if (!response.ok) throw new Error('Geocoding failed')
            const { formatted_address } = await response.json()
            handleSearch(formatted_address)
          } catch (error) {
            console.error('Geocoding error:', error)
            handleSearch('Sandy, Utah')
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          handleSearch('Sandy, Utah')
        }
      )
    } else {
      handleSearch('Sandy, Utah')
    }
  }, [initialLocationLoaded])

  const handleDentistSelect = useCallback((dentist: DentistListing) => {
    setSelectedDentist(dentist)
    setIsDetailsOpen(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false)
    setSelectedDentist(null)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-blue-500 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Find a Dentist</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <main className="flex-1 relative">
        {/* Desktop Layout */}
        <div className={`
          hidden lg:flex flex-row
          h-[calc(100vh-200px)]
          transition-all duration-300 ease-in-out
        `}>
          {/* List Section */}
          <div className={`
            w-1/2
            ${isDetailsOpen ? 'w-1/3' : 'w-1/2'}
            transition-all duration-300
            overflow-y-auto
          `}>
            <DentistList
              dentists={filteredDentists || searchResults}
              onDentistSelect={handleDentistSelect}
              selectedDentistId={selectedDentist?.id}
            />
          </div>

          {/* Map Section */}
          <div className={`
            w-1/2
            ${isDetailsOpen ? 'w-2/3' : 'w-1/2'}
            transition-all duration-300
          `}>
            <MapComponent
              dentists={searchResults}
              selectedDentist={selectedDentist}
              onDentistSelect={handleDentistSelect}
              onClusterSelect={handleClusterSelect}
              onClearCluster={handleClearCluster}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden min-h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            <MobileMapCard
              dentists={searchResults}
              selectedDentist={selectedDentist}
              onDentistSelect={handleDentistSelect}
              onClusterSelect={handleClusterSelect}
              onClearCluster={handleClearCluster}
            />
            <DentistList
              dentists={filteredDentists || searchResults}
              onDentistSelect={handleDentistSelect}
              selectedDentistId={selectedDentist?.id}
            />
          </div>
        </div>

        {/* Details Panel */}
        <DentistDetails
          dentist={selectedDentist}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      </main>
    </div>
  )
}
