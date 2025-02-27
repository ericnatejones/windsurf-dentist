import { DentistListing } from '@/types/dentist'

interface Cluster {
  center: google.maps.LatLngLiteral
  dentists: DentistListing[]
  bounds: google.maps.LatLngBounds
}

const GRID_SIZE = 60 // pixels
const MAX_ZOOM = 15

export function createClusters(
  map: google.maps.Map,
  dentists: DentistListing[],
  zoom: number
): Cluster[] {
  if (zoom >= MAX_ZOOM) {
    // At max zoom, no clustering
    return dentists.map(dentist => ({
      center: dentist.location,
      dentists: [dentist],
      bounds: new google.maps.LatLngBounds(dentist.location, dentist.location)
    }))
  }

  const clusters: Cluster[] = []
  const points = dentists.map(dentist => ({
    dentist,
    pixel: map.getProjection()?.fromLatLngToPoint(dentist.location)
  })).filter(point => point.pixel) as { dentist: DentistListing; pixel: google.maps.Point }[]

  points.forEach(point => {
    let addedToCluster = false

    for (const cluster of clusters) {
      const centerPixel = map.getProjection()?.fromLatLngToPoint(cluster.center)
      if (!centerPixel) continue

      const distance = Math.sqrt(
        Math.pow(point.pixel.x - centerPixel.x, 2) +
        Math.pow(point.pixel.y - centerPixel.y, 2)
      )

      if (distance < GRID_SIZE / Math.pow(2, zoom)) {
        cluster.dentists.push(point.dentist)
        cluster.bounds.extend(point.dentist.location)
        addedToCluster = true
        break
      }
    }

    if (!addedToCluster) {
      const bounds = new google.maps.LatLngBounds(point.dentist.location, point.dentist.location)
      clusters.push({
        center: point.dentist.location,
        dentists: [point.dentist],
        bounds
      })
    }
  })

  return clusters
}
