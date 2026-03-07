import React, { createContext, useContext, useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationContextType {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<Location | null>;
  hasPermission: boolean;
  permissionDenied: boolean;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Request location permission on app load
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        setLocation(newLocation);
        setHasPermission(true);
        setPermissionDenied(false);
        setIsLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        if (err.code === 1) {
          // Permission denied
          setPermissionDenied(true);
          setError("Location permission denied. Please enable it in your browser settings.");
        } else if (err.code === 2) {
          setError("Unable to retrieve your location. Please check your connection.");
        } else if (err.code === 3) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("An error occurred while retrieving your location.");
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const requestLocation = async (): Promise<Location | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        resolve(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          setLocation(newLocation);
          setHasPermission(true);
          setPermissionDenied(false);
          setIsLoading(false);
          resolve(newLocation);
        },
        (err) => {
          console.error("Geolocation error:", err);
          if (err.code === 1) {
            setPermissionDenied(true);
            setError("Location permission denied. Please enable it in your browser settings.");
          } else if (err.code === 2) {
            setError("Unable to retrieve your location. Please check your connection.");
          } else if (err.code === 3) {
            setError("Location request timed out. Please try again.");
          } else {
            setError("An error occurred while retrieving your location.");
          }
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return (
    <GeolocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        requestLocation,
        hasPermission,
        permissionDenied,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error("useGeolocation must be used within a GeolocationProvider");
  }
  return context;
}
