'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface SearchBarProps {
  onSearch?: (location: string) => void
}

interface Prediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle clicks outside of search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['locationSuggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return []
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }
      const data = await response.json()
      return data.predictions || []
    },
    enabled: searchTerm.length > 2,
  })

  const handleSearch = () => {
    if (searchTerm) {
      onSearch?.(searchTerm)
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSuggestionClick = (suggestion: Prediction) => {
    setSearchTerm(suggestion.description)
    setShowSuggestions(false)
    onSearch?.(suggestion.description)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      <div className="flex">
        <div className="relative flex-1 bg-white rounded-l-lg">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter a state, city, or ZIP code"
            className="w-full px-6 py-4 text-gray-900 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <button
          className="px-6 py-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[60px]"
          onClick={handleSearch}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion: Prediction) => (
            <div
              key={suggestion.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-gray-900">{suggestion.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
