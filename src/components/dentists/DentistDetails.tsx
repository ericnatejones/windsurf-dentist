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
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
  }>
}

export function DentistDetails({ dentist, onClose, isOpen }: DentistDetailsProps) {
  const [detailedDentist, setDetailedDentist] = useState<DetailedDentist | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchDetails() {
      if (!dentist?.placeId) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dentists/${dentist.placeId}`)
        if (!response.ok) throw new Error('Failed to fetch details')
        const data = await response.json()
        if (data.success && data.data.dentist) {
          setDetailedDentist(data.data.dentist)
        } else {
          throw new Error(data.error || 'Failed to fetch details')
        }
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

  const displayDentist = detailedDentist || dentist

  if (!displayDentist) return null

  return (
    <div 
      className={`
        fixed inset-0 bg-black bg-opacity-50 z-50 
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`
          fixed inset-y-0 right-0 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-full sm:w-[480px] md:w-[600px] lg:w-[800px]
          overflow-y-auto
          z-50
        `}
      >
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-2xl font-semibold text-gray-900">{displayDentist.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
              aria-label="Close details"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {displayDentist.photos && displayDentist.photos.length > 0 && (
                <div className="mb-6">
                  <PhotoGallery photos={displayDentist.photos} />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-700">{displayDentist.address}</p>
                </div>

                {displayDentist.phone && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-700">
                      <a href={`tel:${displayDentist.phone}`} className="text-blue-600 hover:text-blue-800">
                        {displayDentist.phone}
                      </a>
                    </p>
                  </div>
                )}

                {displayDentist.website && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Website</h3>
                    <p className="text-gray-700">
                      <a
                        href={displayDentist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {displayDentist.website}
                      </a>
                    </p>
                  </div>
                )}

                {displayDentist.opening_hours?.weekday_text && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <BusinessHours hours={displayDentist.opening_hours.weekday_text} />
                  </div>
                )}

                {detailedDentist?.reviews && detailedDentist.reviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
                    <div className="space-y-4">
                      {detailedDentist.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{review.author_name}</span>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1 text-gray-700">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-2">{review.text}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {new Date(review.time * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
