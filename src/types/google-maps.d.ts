// Type definitions for Google Maps Advanced Markers
export interface AdvancedMarkerElementOptions {
  map?: google.maps.Map;
  position?: google.maps.LatLng | google.maps.LatLngLiteral;
  title?: string;
  content?: HTMLElement;
}

// Use the actual Google Maps type
export type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

// Augment the global Window interface
declare global {
  interface Window {
    google: {
      maps: {
        marker: {
          AdvancedMarkerElement: {
            prototype: AdvancedMarkerElement;
            new(options?: AdvancedMarkerElementOptions): AdvancedMarkerElement;
          };
        };
      };
    };
  }
}
