'use client'

import { DentistListing } from '@/types/dentist'
import { PhotoGallery } from './PhotoGallery'
import { BusinessHours } from './BusinessHours'
import { useEffect, useState } from 'react'

interface DentistDetailsProps {
  dentist: DentistListing | null
  onClose: () => void
  isOpen: boolean
}

interface DetailedDentist extends DentistListing {
  hours: string[]
  reviews: Array<{
    author: string
    rating: number
    text: string
    time: number
    authorPhoto: string
  }>
  priceLevel?: number
}

export function DentistDetails({ dentist, onClose, isOpen }: DentistDetailsProps) {
  const [detailedDentist, setDetailedDentist] = useState<DetailedDentist | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchDetails() {
      if (!dentist?.id) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dentists/${dentist.id}`)
        if (!response.ok) throw new Error('Failed to fetch details')
        const data = await response.json()
        setDetailedDentist(data)
      } catch (error) {
        console.error('Error fetching dentist details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && dentist) {
      setDetailedDentist(null) // Reset details when opening new dentist
      fetchDetails()
    }
  }, [dentist, isOpen])

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!dentist) return null

  const displayDentist = detailedDentist || dentist

  return (
    <div
      className={`
        fixed inset-0 lg:relative lg:inset-auto lg:h-full
        ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
    >
      {/* Overlay for mobile */}
      <div
        className={`
          fixed inset-0 bg-black lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed bottom-0 inset-x-0 lg:relative lg:inset-auto
          bg-white rounded-t-3xl lg:rounded-none lg:h-full
          transform transition-all duration-500 ease-out
          ${isOpen 
            ? isLoading 
              ? 'translate-y-[70%] lg:translate-y-0 lg:translate-x-[70%]' 
              : 'translate-y-0 lg:translate-x-0'
            : 'translate-y-full lg:translate-x-full'
          }
          max-h-[90vh] lg:max-h-none overflow-y-auto
        `}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading details...</p>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className={`p-6 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{displayDentist.name}</h2>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(displayDentist.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-600">({displayDentist.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Rest of the content */}
          <div className={`space-y-6 ${!detailedDentist ? 'opacity-50' : ''}`}>
            {/* Emergency Care Notice */}
            {displayDentist.emergencyCare && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900">Emergency Dental Care Available</h3>
                <p className="text-blue-800 mt-1">Same Day Appointments - Call Now</p>
              </div>
            )}

            {/* Photo Gallery */}
            {displayDentist.photos && displayDentist.photos.length > 0 && (
              <div className="mb-6">
                <PhotoGallery photos={displayDentist.photos} dentistName={displayDentist.name} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <a
                href={`tel:${displayDentist.phone}`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              {displayDentist.website && (
                <a
                  href={displayDentist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </a>
              )}
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Directions
              </button>
            </div>

            {/* Details Sections */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location & Hours</h3>
                <p className="text-gray-600 mb-2">{displayDentist.address}</p>
                {detailedDentist?.hours && (
                  <BusinessHours hours={detailedDentist.hours} />
                )}
              </div>

              {displayDentist.specialties && displayDentist.specialties.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayDentist.specialties.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailedDentist?.reviews && detailedDentist.reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
                  <div className="space-y-4">
                    {detailedDentist.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-gray-600 text-sm">{review.author}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
