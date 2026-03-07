import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, MapPin, Plus, Navigation } from "lucide-react";
import { MapView } from "@/components/Map";
import { toast } from "sonner";

type StatusType = "submitted" | "in_progress" | "resolved" | "rejected";

interface MarkerData {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  status: StatusType;
  classification: string;
  priority: string;
  impactScore: number;
}

interface ClickedLocation {
  latitude: number;
  longitude: number;
}

export default function InteractiveMap() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<ClickedLocation | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { data: allProblems, isLoading, error } = trpc.admin.allProblems.useQuery({
    limit: 1000,
    offset: 0,
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to San Francisco if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, []);

  // Process problems into markers
  useEffect(() => {
    if (allProblems && Array.isArray(allProblems)) {
      const processedMarkers = allProblems
        .filter((item: any) => item.problem.latitude && item.problem.longitude)
        .filter((item: any) => {
          if (statusFilter === "all") return true;
          return item.problem.status === statusFilter;
        })
        .map((item: any) => ({
          id: item.problem.id,
          title: item.problem.title,
          latitude: parseFloat(item.problem.latitude!),
          longitude: parseFloat(item.problem.longitude!),
          status: item.problem.status as StatusType,
          classification: item.report?.classification || "unknown",
          priority: item.report?.priority || "low",
          impactScore: item.report?.impactScore || 0,
        }));

      setMarkers(processedMarkers);
    }
  }, [allProblems, statusFilter]);

  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case "submitted":
        return "#3B82F6";
      case "in_progress":
        return "#FBBF24";
      case "resolved":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: StatusType): string => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleMapReady = (map: google.maps.Map) => {
    setMapInstance(map);
    setMapReady(true);

    // Add markers
    markers.forEach((marker) => {
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: getStatusColor(marker.status),
        fillOpacity: 0.8,
        strokeColor: "#fff",
        strokeWeight: 2,
      };

      const gMarker = new google.maps.Marker({
        position: { lat: marker.latitude, lng: marker.longitude },
        map,
        title: marker.title,
        icon: markerIcon,
      });

      gMarker.addListener("click", () => {
        setSelectedMarker(marker);
      });
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#8B5CF6",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
      });
    }

    // Add click listener for adding new problems
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setClickedLocation({
          latitude: e.latLng.lat(),
          longitude: e.latLng.lng(),
        });

        // Add temporary marker at clicked location
        new google.maps.Marker({
          position: e.latLng,
          map,
          title: "New Problem Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#EC4899",
            fillOpacity: 0.6,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
      }
    });

    // Center map on user location or default
    if (userLocation) {
      map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(14);
    }
  };

  const handleAddProblemAtLocation = () => {
    if (!clickedLocation) {
      toast.error("Please click on the map to select a location");
      return;
    }

    // Store location in session storage and navigate to submit problem
    sessionStorage.setItem(
      "problemLocation",
      JSON.stringify({
        latitude: clickedLocation.latitude,
        longitude: clickedLocation.longitude,
      })
    );

    setLocation("/submit");
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      mapInstance.setZoom(14);
    } else {
      toast.error("Unable to get your location");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <Card className="card-elegant p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Map</h2>
          <p className="text-muted-foreground">Failed to load problems. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
      <div className="container max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Community Problems Map</h1>
          <p className="text-lg text-muted-foreground">
            View nearby incidents and click on the map to report a new problem
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Map */}
          <div className="md:col-span-3">
            <Card className="card-elegant p-4 h-[600px] relative">
              <MapView
                onMapReady={handleMapReady}
                initialCenter={userLocation || { lat: 37.7749, lng: -122.4194 }}
                initialZoom={14}
              />

              {/* Map Controls */}
              <div className="absolute top-6 right-6 space-y-2">
                <Button
                  onClick={handleCenterOnUser}
                  size="sm"
                  className="gap-2 shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  My Location
                </Button>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm rounded-lg p-3 text-sm max-w-xs">
                <p className="font-semibold mb-1">💡 How to use:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Click on the map to select a location</li>
                  <li>• Use the button below to add a problem</li>
                  <li>• View nearby incidents by status</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Filter */}
            <Card className="card-elegant p-4">
              <h3 className="font-semibold mb-3">Filter by Status</h3>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Add Problem Button */}
            <Card className="card-elegant p-4">
              <h3 className="font-semibold mb-3">Add Problem</h3>
              {clickedLocation ? (
                <div className="space-y-3">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Selected Location:</p>
                    <p className="text-sm font-mono">
                      {clickedLocation.latitude.toFixed(4)}, {clickedLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    onClick={handleAddProblemAtLocation}
                    className="w-full gap-2 btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Report Problem Here
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setClickedLocation(null)}
                    className="w-full"
                  >
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on the map to select a location for your problem report
                </p>
              )}
            </Card>

            {/* Statistics */}
            <Card className="card-elegant p-4">
              <h3 className="font-semibold mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Reports:</span>
                  <span className="font-semibold">{markers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-semibold text-blue-600">
                    {markers.filter((m) => m.status === "submitted").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress:</span>
                  <span className="font-semibold text-yellow-600">
                    {markers.filter((m) => m.status === "in_progress").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resolved:</span>
                  <span className="font-semibold text-green-600">
                    {markers.filter((m) => m.status === "resolved").length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Selected Marker Details */}
            {selectedMarker && (
              <Card className="card-elegant p-4 border-l-4 border-primary">
                <h3 className="font-semibold mb-3">Selected Problem</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm font-medium line-clamp-2">{selectedMarker.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      {getStatusLabel(selectedMarker.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="text-sm font-medium capitalize">{selectedMarker.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Impact Score</p>
                    <p className="text-sm font-medium">{selectedMarker.impactScore}/100</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
