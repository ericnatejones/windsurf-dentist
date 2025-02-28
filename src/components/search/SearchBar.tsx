import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (location: string) => void
}

interface Prediction {
  description: string
  placeId: string
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [input, setInput] = useState('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const debouncedInput = useDebounce(input, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!debouncedInput) {
        setPredictions([])
        return
      }

      try {
        const response = await fetch(
          `/api/locations/autocomplete?input=${encodeURIComponent(debouncedInput)}`
        )
        if (!response.ok) throw new Error('Failed to fetch predictions')
        const data = await response.json()
        setPredictions(data.predictions)
        setIsOpen(true)
      } catch (error) {
        console.error('Error fetching predictions:', error)
        setPredictions([])
      }
    }

    fetchPredictions()
  }, [debouncedInput])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input.trim())
      setIsOpen(false)
    }
  }

  const handlePredictionClick = (prediction: Prediction) => {
    setInput(prediction.description)
    onSearch(prediction.description)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="search-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a state, city, or ZIP code"
            className="search-input flex-grow"
            onFocus={() => input && setIsOpen(true)}
          />
          <button
            type="submit"
            className="search-button"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </form>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              onClick={() => handlePredictionClick(prediction)}
            >
              {prediction.description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
