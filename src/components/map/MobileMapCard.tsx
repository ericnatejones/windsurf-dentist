'use client'

import { useState } from 'react'
import { DentistListing } from '@/types/dentist'
import { MapComponent } from './MapComponent'

interface MobileMapCardProps {
  dentists: DentistListing[]
  selectedDentist: DentistListing | null
  onDentistSelect: (dentist: DentistListing) => void
  onClusterSelect: (dentists: DentistListing[]) => void
}

export function MobileMapCard({
  dentists,
  selectedDentist,
  onDentistSelect,
  onClusterSelect
}: MobileMapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredDentist, setHoveredDentist] = useState<DentistListing | null>(null)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="relative">
        {/* Preview Map (always visible) */}
        <div className="h-32 relative">
          <MapComponent
            dentists={dentists}
            selectedDentist={selectedDentist}
            hoveredDentist={hoveredDentist}
            onDentistSelect={onDentistSelect}
            onDentistHover={setHoveredDentist}
            onClusterSelect={onClusterSelect}
          />
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 right-2 px-4 py-2 bg-white rounded-full shadow-md flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors z-10"
        >
          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expandable Map */}
      <div
        className={`
          transition-[max-height] duration-300 ease-in-out
          ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}
        `}
      >
        <div className="h-[500px]">
          <MapComponent
            dentists={dentists}
            selectedDentist={selectedDentist}
            hoveredDentist={hoveredDentist}
            onDentistSelect={onDentistSelect}
            onDentistHover={setHoveredDentist}
            onClusterSelect={onClusterSelect}
          />
        </div>
      </div>
    </div>
  )
}
