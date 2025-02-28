'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface GoogleMapImageProps extends Omit<ImageProps, 'src'> {
  photoUrl: string
  fallbackUrl?: string
}

export function GoogleMapImage({ 
  photoUrl, 
  fallbackUrl = '/images/placeholder-dentist.jpg',
  alt,
  ...props 
}: GoogleMapImageProps) {
  const [imgSrc, setImgSrc] = useState(photoUrl)
  const [error, setError] = useState(false)

  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackUrl)
      setError(true)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
}
