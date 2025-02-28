'use client'

import { useRef, useEffect } from 'react'
import { DentistListing } from '@/types/dentist'
import Image from 'next/image'

interface DentistListProps {
  dentists: DentistListing[]
  selectedDentistId?: string | null
  hoveredDentist: DentistListing | null
  onDentistSelect: (dentist: DentistListing) => void
}

export function DentistList({ 
  dentists, 
  selectedDentistId,
  hoveredDentist,
  onDentistSelect 
}: DentistListProps) {
  const listRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (hoveredDentist) {
      const element = listRefs.current.get(hoveredDentist.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [hoveredDentist])

  if (!dentists || dentists.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No dentists found in this area
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      <div className="space-y-4 p-4">
        {dentists.map((dentist) => (
          <div
            key={dentist.id}
            ref={(el) => {
              if (el) listRefs.current.set(dentist.id, el)
              else listRefs.current.delete(dentist.id)
            }}
            className={`
              p-4 rounded-lg shadow-sm border transition-all duration-200
              ${selectedDentistId === dentist.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
              ${hoveredDentist?.id === dentist.id ? 'transform scale-[1.02] border-blue-300' : ''}
              hover:shadow-md cursor-pointer
            `}
            onClick={() => onDentistSelect(dentist)}
          >
            <div className="flex gap-3">
              {dentist.photos && dentist.photos.length > 0 && (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={dentist.photos[0].url}
                    alt={`${dentist.name} thumbnail`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{dentist.name}</h3>
                <p className="text-gray-600 text-sm mt-1 truncate">{dentist.address}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(dentist.rating) ? 'fill-current' : 'fill-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm ml-2">
                    ({dentist.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
