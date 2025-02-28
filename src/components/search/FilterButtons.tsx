'use client'

import { useState } from 'react'

interface FilterOption {
  id: string
  name: string
}

interface FilterButtonsProps {
  insuranceOptions: FilterOption[]
  specialtyOptions: FilterOption[]
  onFilterChange: (filters: {
    insurances: string[]
    specialties: string[]
  }) => void
}

export function FilterButtons({
  insuranceOptions,
  specialtyOptions,
  onFilterChange
}: FilterButtonsProps) {
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showAllFilters, setShowAllFilters] = useState(false)

  const handleInsuranceToggle = (id: string) => {
    // Visual toggle only - no actual filtering
    setSelectedInsurances(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]

      return newSelection
    })
    
    // For visual feedback only - doesn't actually filter
    if (onFilterChange) {
      onFilterChange({
        insurances: selectedInsurances,
        specialties: selectedSpecialties
      })
    }
  }

  const handleSpecialtyToggle = (id: string) => {
    // Visual toggle only - no actual filtering
    setSelectedSpecialties(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
      
      return newSelection
    })
    
    // For visual feedback only - doesn't actually filter
    if (onFilterChange) {
      onFilterChange({
        insurances: selectedInsurances,
        specialties: selectedSpecialties
      })
    }
  }

  const clearAllFilters = () => {
    // Visual clearing only - no actual filtering
    setSelectedInsurances([])
    setSelectedSpecialties([])
    
    // For visual feedback only - doesn't actually filter
    if (onFilterChange) {
      onFilterChange({
        insurances: [],
        specialties: []
      })
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* All Filters Button */}
      <div className="relative">
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className={`filter-button ${
            selectedInsurances.length > 0 || selectedSpecialties.length > 0
              ? 'filter-button-active'
              : ''
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>All Filters</span>
          {(selectedInsurances.length > 0 || selectedSpecialties.length > 0) && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
              {selectedInsurances.length + selectedSpecialties.length}
            </span>
          )}
        </button>

        {showAllFilters && (
          <div className="absolute left-0 z-50 mt-2 bg-white rounded-lg shadow-xl w-72 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">All Filters</h3>
              <button 
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            
            {/* Insurance Section */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Insurance</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {insuranceOptions.map(option => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedInsurances.includes(option.id)}
                      onChange={() => handleInsuranceToggle(option.id)}
                    />
                    <span className="ml-2 text-gray-700">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Specialty Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Specialty</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {specialtyOptions.map(option => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedSpecialties.includes(option.id)}
                      onChange={() => handleSpecialtyToggle(option.id)}
                    />
                    <span className="ml-2 text-gray-700">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insurance Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowInsuranceDropdown(!showInsuranceDropdown)
            setShowSpecialtyDropdown(false)
            setShowAllFilters(false)
          }}
          className={`filter-button ${
            selectedInsurances.length > 0
              ? 'filter-button-active'
              : ''
          }`}
        >
          <span>Insurance</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
          {selectedInsurances.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
              {selectedInsurances.length}
            </span>
          )}
        </button>

        {showInsuranceDropdown && (
          <div className="absolute left-0 z-50 mt-2 bg-white rounded-lg shadow-xl w-64 p-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {insuranceOptions.map(option => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={selectedInsurances.includes(option.id)}
                    onChange={() => handleInsuranceToggle(option.id)}
                  />
                  <span className="ml-2 text-gray-700">{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Specialty Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSpecialtyDropdown(!showSpecialtyDropdown)
            setShowInsuranceDropdown(false)
            setShowAllFilters(false)
          }}
          className={`filter-button ${
            selectedSpecialties.length > 0
              ? 'filter-button-active'
              : ''
          }`}
        >
          <span>Specialty</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
          {selectedSpecialties.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
              {selectedSpecialties.length}
            </span>
          )}
        </button>

        {showSpecialtyDropdown && (
          <div className="absolute left-0 z-50 mt-2 bg-white rounded-lg shadow-xl w-64 p-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {specialtyOptions.map(option => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={selectedSpecialties.includes(option.id)}
                    onChange={() => handleSpecialtyToggle(option.id)}
                  />
                  <span className="ml-2 text-gray-700">{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
