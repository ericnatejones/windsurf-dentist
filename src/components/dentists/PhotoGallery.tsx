'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DentistPhoto } from '@/types/dentist'

interface PhotoGalleryProps {
  photos: DentistPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<DentistPhoto | null>(null)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 6).map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhoto(photo)}
            className="relative w-full aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <Image
              src={photo.url}
              alt={`Dentist office photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full aspect-video">
              <Image
                src={selectedPhoto.url}
                alt="Selected dentist office photo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
