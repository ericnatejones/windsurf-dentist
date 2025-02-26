'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PhotoGalleryProps {
  photos: string[]
  dentistName: string
}

export function PhotoGallery({ photos, dentistName }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  if (!photos.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(0, 4).map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(index)}
          >
            <Image
              src={photo}
              alt={`${dentistName} photo ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover hover:opacity-90 transition-opacity"
            />
            {index === 3 && photos.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={() => setSelectedPhoto(prev => (prev === 0 ? photos.length - 1 : prev! - 1))}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setSelectedPhoto(prev => (prev === photos.length - 1 ? 0 : prev! + 1))}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="relative w-full max-w-4xl aspect-square">
            <Image
              src={photos[selectedPhoto]}
              alt={`${dentistName} photo ${selectedPhoto + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {selectedPhoto + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
