/**
 * Global Google Maps API Script Loader
 * 
 * This utility ensures the Google Maps API script is loaded only once,
 * preventing the "Google Maps JavaScript API multiple times" error.
 * 
 * Usage:
 * const loaded = await loadGoogleMapsScript();
 * if (loaded) {
 *   // Use google.maps API
 * }
 */

declare global {
  interface Window {
    google?: typeof google;
    __mapsScriptLoading?: Promise<void>;
    __mapsScriptLoaded?: boolean;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

/**
 * Load Google Maps API script globally
 * Returns a promise that resolves when the script is loaded
 * Multiple calls will return the same promise, preventing duplicate loads
 */
export function loadGoogleMapsScript(): Promise<void> {
  // If already loaded, resolve immediately
  if (window.__mapsScriptLoaded && window.google) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (window.__mapsScriptLoading) {
    return window.__mapsScriptLoading;
  }

  // Create a new loading promise
  const loadingPromise = new Promise<void>((resolve, reject) => {
    // Check one more time in case another load started
    if (window.__mapsScriptLoaded && window.google) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      window.__mapsScriptLoaded = true;
      window.__mapsScriptLoading = undefined;
      resolve();
    };

    script.onerror = () => {
      window.__mapsScriptLoading = undefined;
      console.error("Failed to load Google Maps script");
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  // Store the loading promise globally to prevent duplicate loads
  window.__mapsScriptLoading = loadingPromise;

  return loadingPromise;
}
