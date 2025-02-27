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

  const displayDentist = detailedDentist || dentist

  if (!displayDentist) return null

  return (
    <>
      {/* Backdrop for clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/2 bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        z-50 overflow-y-auto
      `}>
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{displayDentist.name}</h2>

              {displayDentist.photos && displayDentist.photos.length > 0 && (
                <PhotoGallery photos={displayDentist.photos} />
              )}

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(displayDentist.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {displayDentist.rating} ({displayDentist.reviewCount} reviews)
                  </span>
                </div>

                <p className="text-gray-600">{displayDentist.address}</p>

                {displayDentist.phone && (
                  <a
                    href={`tel:${displayDentist.phone}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {displayDentist.phone}
                  </a>
                )}

                {displayDentist.website && (
                  <a
                    href={displayDentist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}

                {displayDentist.specialties?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayDentist.specialties.map(specialty => (
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

                {displayDentist.hours?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <BusinessHours hours={displayDentist.hours} />
                  </div>
                )}

                {detailedDentist?.reviews?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reviews</h3>
                    <div className="space-y-4">
                      {detailedDentist.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.author_name}</span>
                            <div className="flex">
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
                          </div>
                          <p className="text-gray-600">{review.text}</p>
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
    </>
  )
}
