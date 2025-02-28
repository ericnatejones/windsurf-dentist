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
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{displayDentist.name}</h2>
                {displayDentist.rating && (
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(displayDentist.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {displayDentist.rating.toFixed(1)} ({displayDentist.user_ratings_total} reviews)
                    </span>
                  </div>
                )}
                {displayDentist.specialties && displayDentist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {displayDentist.specialties.map(specialty => (
                      <span 
                        key={specialty.id} 
                        className="inline-block bg-blue-100 text-primary-blue text-xs px-2 py-1 rounded-full"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                      <p className="text-gray-700">{displayDentist.address}</p>
                      <div className="mt-2 flex space-x-3">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayDentist.address)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-blue hover:text-blue-700"
                        >
                          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          Open in Google Maps
                        </a>
                        {displayDentist.location && (
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${displayDentist.location.lat},${displayDentist.location.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-blue hover:text-blue-700"
                          >
                            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            Get Directions
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {displayDentist.phone && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <a href={`tel:${displayDentist.phone}`} className="text-primary-blue hover:text-blue-700">
                        {displayDentist.phone}
                      </a>
                    </div>
                  </div>
                )}

                {displayDentist.website && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Website</h3>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <a
                        href={displayDentist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-blue hover:text-blue-700 break-all"
                      >
                        {displayDentist.website}
                      </a>
                    </div>
                  </div>
                )}

                {displayDentist.opening_hours?.weekday_text && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <BusinessHours hours={displayDentist.opening_hours.weekday_text} />
                  </div>
                )}

                {displayDentist.insurances && displayDentist.insurances.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Accepted Insurance</h3>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                      <div className="flex flex-wrap gap-2">
                        {displayDentist.insurances.map(insurance => (
                          <span 
                            key={insurance.id} 
                            className="inline-block bg-blue-50 text-primary-blue text-sm px-3 py-1 rounded-full border border-blue-100"
                          >
                            {insurance.name}
                            {insurance.type && <span className="text-xs ml-1 text-gray-500">({insurance.type})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {detailedDentist?.reviews && detailedDentist.reviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
                    <div className="space-y-4">
                      {detailedDentist.reviews.map((review, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center font-medium">
                              {review.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{review.author_name}</div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-500">
                                  {new Date(review.time * 1000).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.text}</p>
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
