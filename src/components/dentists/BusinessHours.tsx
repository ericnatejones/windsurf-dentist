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
  
  // Simplified open/closed status
  const isOpen = todayHours.toLowerCase().includes('open now') || 
                !todayHours.toLowerCase().includes('closed');

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="font-medium text-gray-900">
              {!isExpanded && (
                <span>Today: {todayHours.split(': ')[1]}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {isOpen ? 'Open now' : 'Closed now'}
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded-full">
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
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
          {hours.map((hour, index) => {
            const [day, time] = hour.split(': ')
            const isToday = index === todayIndex
            return (
              <div
                key={day}
                className={`flex justify-between items-center ${
                  isToday ? 'text-primary-blue font-medium' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  {isToday && (
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  )}
                  {day}
                </span>
                <span className={isToday ? 'font-medium' : ''}>{time}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
