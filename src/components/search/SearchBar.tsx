import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (location: string) => void
}

interface Prediction {
  description: string
  placeId: string
}

export default function SearchBar({ onSearch }: SearchBarProps) {
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
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a state, city, or ZIP code"
          className="w-full px-4 py-3 text-lg rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
          onFocus={() => input && setIsOpen(true)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
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
