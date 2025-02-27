'use client'

import { DentistListing } from '@/types/dentist'
import Image from 'next/image'
import { useState } from 'react'

interface DentistCardProps {
  dentist: DentistListing;
  onSelect: (dentist: DentistListing) => void;
  isSelected?: boolean;
}

export function DentistCard({ dentist, onSelect, isSelected }: DentistCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div 
      className={`
        p-4 rounded-lg border transition-all cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
      `}
      onClick={() => onSelect(dentist)}
    >
      <div className="flex gap-4">
        {dentist.photos && dentist.photos[0] && !imageError ? (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={dentist.photos[0].url}
              alt={dentist.name}
              fill
              className="object-cover rounded"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 96px, 96px"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )}
        
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-900">{dentist.name}</h3>
          
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(dentist.rating)
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
            <span className="text-sm text-gray-600">
              {dentist.rating} ({dentist.reviewCount})
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">{dentist.address}</p>
          
          {dentist.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dentist.specialties.map(specialty => (
                <span
                  key={specialty.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {specialty.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
