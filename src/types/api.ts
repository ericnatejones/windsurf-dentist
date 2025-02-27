import { NextResponse } from 'next/server'

export type ApiResponse<T> = NextResponse<{
  success: boolean
  data: T
  error?: string
}>

export type ApiErrorResponse = NextResponse<{
  success: false
  error: string
  data: null
}>

export interface LocationAutocompleteResult {
  description: string
  placeId: string
  mainText: string
  secondaryText: string
}

export interface GeocodeResult {
  latitude: number
  longitude: number
  formattedAddress: string
}
