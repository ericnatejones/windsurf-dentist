import { DentistListing } from '@/types/dentist'

interface Cluster {
  center: google.maps.LatLngLiteral
  bounds: google.maps.LatLngBounds
  dentists: DentistListing[]
  isNearby: boolean
}

// Base clustering parameters
const BASE_CLUSTER_RADIUS = 500 // meters
const MAX_NEARBY_DENTISTS = 5 // max number of individual markers to show
const MIN_CLUSTER_SIZE = 2 // minimum dentists to form a cluster
const ZOOM_CLUSTER_THRESHOLD = 13 // zoom level at which we start showing more individual markers

function getDistance(p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral): number {
  const R = 6371000 // Earth's radius in meters
  const lat1 = p1.lat * Math.PI / 180
  const lat2 = p2.lat * Math.PI / 180
  const dLat = (p2.lat - p1.lat) * Math.PI / 180
  const dLon = (p2.lng - p1.lng) * Math.PI / 180

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function createClusters(
  map: google.maps.Map,
  dentists: DentistListing[],
  zoom: number
): Cluster[] {
  const mapCenter = map.getCenter()
  if (!mapCenter || !dentists.length) return []
  
  const center = { lat: mapCenter.lat(), lng: mapCenter.lng() }
  
  // Adjust cluster radius and max nearby dentists based on zoom level
  const zoomFactor = Math.pow(2, 20 - zoom)
  const clusterRadius = BASE_CLUSTER_RADIUS * (zoomFactor / 10)
  const maxNearby = zoom >= ZOOM_CLUSTER_THRESHOLD ? MAX_NEARBY_DENTISTS * 2 : MAX_NEARBY_DENTISTS
  
  // Sort dentists by distance from map center
  const dentistsWithDistance = dentists.map(dentist => ({
    dentist,
    distance: getDistance(center, dentist.location)
  })).sort((a, b) => a.distance - b.distance)
  
  // First pass: Create individual markers for nearest dentists
  const nearbyDentists = dentistsWithDistance.slice(0, maxNearby)
  const farDentists = dentistsWithDistance.slice(maxNearby)
  
  const clusters: Cluster[] = nearbyDentists.map(({ dentist }) => ({
    center: dentist.location,
    bounds: new google.maps.LatLngBounds(dentist.location, dentist.location),
    dentists: [dentist],
    isNearby: true
  }))
  
  // Second pass: Cluster remaining dentists
  for (const { dentist } of farDentists) {
    let addedToCluster = false
    
    // Try to add to existing far cluster
    for (const cluster of clusters) {
      if (cluster.isNearby) continue // Skip nearby clusters
      
      const distanceToCluster = getDistance(dentist.location, cluster.center)
      if (distanceToCluster <= clusterRadius) {
        cluster.dentists.push(dentist)
        cluster.bounds.extend(dentist.location)
        cluster.center = {
          lat: (cluster.bounds.getNorthEast().lat() + cluster.bounds.getSouthWest().lat()) / 2,
          lng: (cluster.bounds.getNorthEast().lng() + cluster.bounds.getSouthWest().lng()) / 2
        }
        addedToCluster = true
        break
      }
    }
    
    // Create new cluster if not added
    if (!addedToCluster) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(dentist.location)
      clusters.push({
        center: dentist.location,
        bounds,
        dentists: [dentist],
        isNearby: false
      })
    }
  }
  
  // Final pass: Merge small far clusters and ensure proper mix
  return clusters.filter(cluster => 
    cluster.isNearby || (cluster.dentists.length >= MIN_CLUSTER_SIZE && cluster.dentists.length > 1)
  )
}
