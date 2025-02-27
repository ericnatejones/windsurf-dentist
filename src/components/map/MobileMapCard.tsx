'use client'

import { useState } from 'react'
import { DentistListing } from '@/types/dentist'
import { MapComponent } from './MapComponent'

interface MobileMapCardProps {
  dentists: DentistListing[]
  selectedDentist: DentistListing | null
  onDentistSelect: (dentist: DentistListing) => void
  onClusterSelect?: (dentists: DentistListing[]) => void
  onClearCluster?: () => void
}

export function MobileMapCard({ 
  dentists, 
  selectedDentist, 
  onDentistSelect,
  onClusterSelect,
  onClearCluster 
}: MobileMapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className={`
        relative bg-white rounded-lg shadow-lg overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'h-[70vh]' : 'h-64'}
      `}
    >
      <MapComponent
        dentists={dentists}
        selectedDentist={selectedDentist}
        onDentistSelect={onDentistSelect}
        onClusterSelect={onClusterSelect}
        onClearCluster={onClearCluster}
      />
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg text-blue-600 font-medium z-10 hover:bg-blue-50 transition-colors"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  )
}
