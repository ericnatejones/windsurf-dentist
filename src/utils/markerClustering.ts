import { DentistListing } from '@/types/dentist'

interface Cluster {
  center: google.maps.LatLngLiteral
  bounds: google.maps.LatLngBounds
  dentists: DentistListing[]
  isNearby: boolean
  level: number
  parentClusterId?: string
  id: string
  canZoomIn: boolean
}

// Base clustering parameters
const BASE_CLUSTER_RADIUS = 500 // meters
const MAX_NEARBY_DENTISTS = 5 // max number of individual markers to show
const MIN_CLUSTER_SIZE = 2 // minimum dentists to form a cluster
const ZOOM_CLUSTER_THRESHOLD = 13 // zoom level at which we start showing more individual markers
const MAX_CLUSTER_LEVELS = 3 // maximum number of clustering levels

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

// Generate a unique ID for a cluster
function generateClusterId(dentists: DentistListing[], level: number): string {
  const dentistIds = dentists.map(d => d.id).sort().join('-')
  return `cluster-${level}-${dentistIds}`
}

// Check if a cluster can be further subdivided
function canClusterZoomIn(cluster: Cluster, zoom: number): boolean {
  if (cluster.level >= MAX_CLUSTER_LEVELS) return false
  if (cluster.dentists.length <= MIN_CLUSTER_SIZE) return false
  
  // For higher zoom levels, require more dentists to form a sub-cluster
  const minDentistsForSubclustering = Math.max(3, Math.floor(5 - (zoom - 10) / 2))
  return cluster.dentists.length >= minDentistsForSubclustering
}

export function createClusters(
  map: google.maps.Map,
  dentists: DentistListing[],
  zoom: number,
  selectedClusterId?: string,
  level: number = 1
): Cluster[] {
  const mapCenter = map.getCenter()
  if (!mapCenter || !dentists.length) return []
  
  const center = { lat: mapCenter.lat(), lng: mapCenter.lng() }
  
  // Adjust cluster radius and max nearby dentists based on zoom level
  const zoomFactor = Math.pow(2, 20 - zoom)
  const clusterRadius = BASE_CLUSTER_RADIUS * (zoomFactor / 10) / level
  const maxNearby = zoom >= ZOOM_CLUSTER_THRESHOLD ? MAX_NEARBY_DENTISTS * 2 : MAX_NEARBY_DENTISTS
  
  // If we're looking at a selected cluster and it can be subdivided, create subclusters
  if (selectedClusterId && level < MAX_CLUSTER_LEVELS) {
    // Find if we have a selected cluster that needs subclustering
    const selectedCluster = dentists.length > 10 && zoom < 15
    
    // If we're zoomed in enough, don't cluster at all
    if (zoom >= 16) {
      return dentists.map(dentist => ({
        center: dentist.location,
        bounds: new google.maps.LatLngBounds(dentist.location, dentist.location),
        dentists: [dentist],
        isNearby: true,
        level,
        id: `single-${dentist.id}`,
        canZoomIn: false
      }))
    }
    
    // If we have a selected cluster, create subclusters with a smaller radius
    if (selectedCluster) {
      // Use a smaller radius for subclustering
      const subClusterRadius = clusterRadius * 0.6
      return createSubClusters(dentists, subClusterRadius, level + 1, selectedClusterId)
    }
  }
  
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
    isNearby: true,
    level,
    id: `single-${dentist.id}`,
    canZoomIn: false
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
        // Update the cluster ID after adding a new dentist
        cluster.id = generateClusterId(cluster.dentists, level)
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
        isNearby: false,
        level,
        id: generateClusterId([dentist], level),
        canZoomIn: false
      })
    }
  }
  
  // Final pass: Update canZoomIn property and filter small clusters
  const finalClusters = clusters.filter(cluster => 
    cluster.isNearby || (cluster.dentists.length >= MIN_CLUSTER_SIZE && cluster.dentists.length > 1)
  )
  
  // Update canZoomIn property
  finalClusters.forEach(cluster => {
    cluster.canZoomIn = canClusterZoomIn(cluster, zoom)
  })
  
  return finalClusters
}

// Create subclusters for a selected cluster
function createSubClusters(
  dentists: DentistListing[],
  radius: number,
  level: number,
  parentClusterId: string
): Cluster[] {
  const clusters: Cluster[] = []
  
  // Start with each dentist as its own cluster
  const remainingDentists = [...dentists]
  
  while (remainingDentists.length > 0) {
    const currentDentist = remainingDentists.shift()!
    const currentCluster: Cluster = {
      center: currentDentist.location,
      bounds: new google.maps.LatLngBounds(currentDentist.location, currentDentist.location),
      dentists: [currentDentist],
      isNearby: false,
      level,
      parentClusterId,
      id: `subcluster-${level}-${currentDentist.id}`,
      canZoomIn: false
    }
    
    // Find nearby dentists to add to this cluster
    for (let i = 0; i < remainingDentists.length; i++) {
      const dentist = remainingDentists[i]
      const distance = getDistance(currentDentist.location, dentist.location)
      
      if (distance <= radius) {
        currentCluster.dentists.push(dentist)
        currentCluster.bounds.extend(dentist.location)
        // Recalculate center
        currentCluster.center = {
          lat: (currentCluster.bounds.getNorthEast().lat() + currentCluster.bounds.getSouthWest().lat()) / 2,
          lng: (currentCluster.bounds.getNorthEast().lng() + currentCluster.bounds.getSouthWest().lng()) / 2
        }
        // Update ID
        currentCluster.id = generateClusterId(currentCluster.dentists, level)
        
        // Remove from remaining
        remainingDentists.splice(i, 1)
        i--
      }
    }
    
    clusters.push(currentCluster)
  }
  
  // Update canZoomIn property
  clusters.forEach(cluster => {
    cluster.canZoomIn = cluster.dentists.length > 3 && level < MAX_CLUSTER_LEVELS
  })
  
  return clusters
}
