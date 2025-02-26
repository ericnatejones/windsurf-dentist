'use client'

import { DentistListing } from '@/types/dentist'
import { DentistCard } from './DentistCard'
import { useState } from 'react'

interface DentistListProps {
  dentists: DentistListing[];
  onDentistSelect: (dentist: DentistListing) => void;
}

export function DentistList({ dentists, onDentistSelect }: DentistListProps) {
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null)

  const handleDentistSelect = (dentist: DentistListing) => {
    setSelectedDentist(dentist.id)
    onDentistSelect(dentist)
  }

  if (dentists.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No dentists found in this area. Try adjusting your search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-auto max-h-[calc(100vh-200px)] p-4">
      {dentists.map((dentist) => (
        <DentistCard
          key={dentist.id}
          dentist={dentist}
          onSelect={handleDentistSelect}
          isSelected={selectedDentist === dentist.id}
        />
      ))}
    </div>
  )
}
