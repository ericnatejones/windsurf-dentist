'use client'

import { DentistListing } from '@/types/dentist'
import Image from 'next/image'

interface DentistCardProps {
  dentist: DentistListing
  isSelected?: boolean
  onClick: (dentist: DentistListing) => void
}

export function DentistCard({ dentist, isSelected, onClick }: DentistCardProps) {
  return (
    <div
      className={`
        p-4 rounded-lg shadow-md cursor-pointer
        transition-all duration-200 ease-in-out
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500' 
          : 'bg-white hover:bg-gray-50 border-2 border-transparent'
        }
      `}
      onClick={() => onClick(dentist)}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        {dentist.photos && dentist.photos.length > 0 ? (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={dentist.photos[0].url}
              alt={`${dentist.name} thumbnail`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{dentist.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{dentist.address}</p>
            </div>
            {dentist.rating > 0 && (
              <div className="flex items-center flex-shrink-0 ml-2">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-sm font-medium text-gray-600">
                  {dentist.rating.toFixed(1)}
                </span>
                {dentist.user_ratings_total > 0 && (
                  <span className="ml-1 text-sm text-gray-500">
                    ({dentist.user_ratings_total})
                  </span>
                )}
              </div>
            )}
          </div>
          
          {dentist.opening_hours && (
            <div className="mt-2">
              <span className={`
                text-sm font-medium px-2 py-1 rounded-full
                ${dentist.opening_hours.open_now 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {dentist.opening_hours.open_now ? 'Open Now' : 'Closed'}
              </span>
            </div>
          )}

          {dentist.specialties && dentist.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {dentist.specialties.map(specialty => (
                <span
                  key={specialty.id}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  {specialty.name}
                </span>
              ))}
            </div>
          )}

          {dentist.insurances && dentist.insurances.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {dentist.insurances.map(insurance => (
                <span
                  key={insurance.id}
                  className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                >
                  {insurance.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
