import { useState, useEffect } from "react";
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
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import { MapView } from "@/components/Map";

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

export default function ProblemsMap() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const { data: allProblems, isLoading, error } = trpc.admin.allProblems.useQuery({
    limit: 1000,
    offset: 0,
  });

  useEffect(() => {
    if (allProblems?.problems) {
      const processedMarkers = allProblems.problems
        .filter((item) => {
          // Only include problems with location data
          return item.problem.latitude && item.problem.longitude;
        })
        .filter((item) => {
          // Apply status filter
          if (statusFilter === "all") return true;
          return item.problem.status === statusFilter;
        })
        .map((item) => ({
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
        return "#3B82F6"; // Blue
      case "in_progress":
        return "#FBBF24"; // Amber
      case "resolved":
        return "#10B981"; // Green
      case "rejected":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
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

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMapReady(true);

    // Add markers to map
    markers.forEach((marker) => {
      const markerColor = getStatusColor(marker.status);

      // Create SVG icon
      const svgIcon = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${markerColor}" opacity="0.9"/>
          <circle cx="16" cy="16" r="12" fill="${markerColor}"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      `;

      const dataUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;

      const googleMarker = new google.maps.Marker({
        position: { lat: marker.latitude, lng: marker.longitude },
        map: mapInstance,
        title: marker.title,
        icon: {
          url: dataUrl,
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${marker.title}</h3>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
              <p style="margin: 4px 0;"><strong>Type:</strong> ${marker.classification.replace(/_/g, " ")}</p>
              <p style="margin: 4px 0;"><strong>Priority:</strong> ${marker.priority}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${getStatusColor(marker.status)}">${getStatusLabel(marker.status)}</span></p>
              <p style="margin: 4px 0;"><strong>Impact:</strong> ${marker.impactScore}/100</p>
            </div>
          </div>
        `,
      });

      googleMarker.addListener("click", () => {
        // Close all other info windows
        infoWindow.open(mapInstance, googleMarker);
        setSelectedMarker(marker);
      });
    });

    // Center map on markers if available
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend({ lat: marker.latitude, lng: marker.longitude });
      });
      mapInstance.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading problems map...</p>
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Problems Map</h1>
          <p className="text-lg text-muted-foreground">
            View all reported problems on an interactive map
          </p>
        </div>

        {/* Filters */}
        <Card className="card-elegant p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <label className="text-sm font-semibold mb-2 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Problems</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#3B82F6" }} />
                <span className="text-sm">Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#FBBF24" }} />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#10B981" }} />
                <span className="text-sm">Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#EF4444" }} />
                <span className="text-sm">Rejected</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Map and Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="card-elegant overflow-hidden h-96 lg:h-full min-h-96">
              {mapReady ? (
                <MapView onMapReady={handleMapReady} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Details Panel */}
          <div>
            <Card className="card-elegant p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Problem Details</h2>

              {selectedMarker ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="font-medium">{selectedMarker.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Classification</p>
                    <p className="font-medium capitalize">
                      {selectedMarker.classification.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <p className="font-medium capitalize">{selectedMarker.priority}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: getStatusColor(selectedMarker.status) }}
                    >
                      {getStatusLabel(selectedMarker.status)}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Impact Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${selectedMarker.impactScore}%` }}
                        />
                      </div>
                      <span className="font-medium">{selectedMarker.impactScore}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                    <p className="text-sm font-mono">
                      {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click on a marker to view problem details
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <Card className="card-elegant p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Problems</p>
            <p className="text-2xl font-bold">{markers.length}</p>
          </Card>
          <Card className="card-elegant p-4">
            <p className="text-sm text-muted-foreground mb-1">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {markers.filter((m) => m.status === "submitted").length}
            </p>
          </Card>
          <Card className="card-elegant p-4">
            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {markers.filter((m) => m.status === "in_progress").length}
            </p>
          </Card>
          <Card className="card-elegant p-4">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {markers.filter((m) => m.status === "resolved").length}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
