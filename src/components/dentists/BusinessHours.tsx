'use client'

import { useState } from 'react'

interface BusinessHoursProps {
  hours: string[]
}

export function BusinessHours({ hours }: BusinessHoursProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hours.length) return null

  const today = new Date().getDay()
  // Adjust for Sunday being 0 in JS but usually last in hours array
  const todayIndex = today === 0 ? 6 : today - 1
  const todayHours = hours[todayIndex]

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-gray-600">
          {!isExpanded && (
            <span>Today: {todayHours.split(': ')[1]}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
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
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {hours.map((hour, index) => {
            const [day, time] = hour.split(': ')
            return (
              <div
                key={day}
                className={`flex justify-between ${
                  index === todayIndex ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}
              >
                <span>{day}</span>
                <span>{time}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
