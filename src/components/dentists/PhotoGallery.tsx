'use client'

import { useState } from 'react'
import { DentistPhoto } from '@/types/dentist'
import { GoogleMapImage } from '@/components/common/GoogleMapImage'

interface PhotoGalleryProps {
  photos: DentistPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Main Photo */}
      <div 
        className="relative h-40 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <GoogleMapImage
          photoUrl={photos[selectedIndex].url}
          alt={`Photo ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden 
                transition-all duration-200
                ${index === selectedIndex ? 'ring-2 ring-blue-500' : 'hover:opacity-80'}
              `}
            >
              <GoogleMapImage
                photoUrl={photo.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(false)
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <GoogleMapImage
              photoUrl={photos[selectedIndex].url}
              alt={`Full size photo ${selectedIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
              width={800}
              height={600}
            />
          </div>
        </div>
      )}
    </div>
  )
}
