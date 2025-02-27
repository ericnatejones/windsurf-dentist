import { MVCObject } from '@googlemaps/js-api-loader'

export interface AdvancedMarkerElementOptions {
  map?: google.maps.Map;
  position?: google.maps.LatLng | google.maps.LatLngLiteral;
  title?: string;
  content?: HTMLElement;
}

export interface AdvancedMarkerElement extends google.maps.MVCObject {
  position: google.maps.LatLng | google.maps.LatLngLiteral | null;
  title: string | null;
  map: google.maps.Map | null;
  content: HTMLElement | null;
  addListener(eventName: 'gmp-click', handler: () => void): google.maps.MapsEventListener;
}

declare global {
  interface Window {
    google: {
      maps: {
        marker: {
          AdvancedMarkerElement: new (options?: AdvancedMarkerElementOptions) => AdvancedMarkerElement;
        };
      };
    };
  }
}
