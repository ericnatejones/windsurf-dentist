declare global {
  namespace google.maps {
    namespace marker {
      class AdvancedMarkerElement extends google.maps.MVCObject {
        constructor(options?: AdvancedMarkerElementOptions);
        position: google.maps.LatLng | google.maps.LatLngLiteral | null;
        title: string | null;
        map: google.maps.Map | null;
        content: HTMLElement | null;
        addListener(eventName: 'gmp-click', handler: () => void): google.maps.MapsEventListener;
      }

      interface AdvancedMarkerElementOptions {
        map?: google.maps.Map;
        position?: google.maps.LatLng | google.maps.LatLngLiteral;
        title?: string;
        content?: HTMLElement;
      }
    }
  }
}
