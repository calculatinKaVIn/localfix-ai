import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, X, AlertCircle, Loader2, TrendingUp, Calendar, User,
  Shield, Leaf, Users, DollarSign, Clock, Filter, RefreshCw, Layers
} from "lucide-react";

// Status color config
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; pin: string }> = {
  submitted:   { label: "Submitted",   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-300",  pin: "#3B82F6" },
  in_progress: { label: "In Progress", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-300", pin: "#F59E0B" },
  resolved:    { label: "Resolved",    color: "text-green-700",  bg: "bg-green-50",  border: "border-green-300", pin: "#10B981" },
  rejected:    { label: "Rejected",    color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300",   pin: "#EF4444" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: "Low",      color: "text-green-700",  bg: "bg-green-100"  },
  medium:   { label: "Medium",   color: "text-blue-700",   bg: "bg-blue-100"   },
  high:     { label: "High",     color: "text-orange-700", bg: "bg-orange-100" },
  critical: { label: "Critical", color: "text-red-700",    bg: "bg-red-100"    },
};

type MapProblem = {
  problem: {
    id: number;
    title: string;
    description: string;
    status: string;
    imageUrl: string | null;
    latitude: string | null;
    longitude: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  report: {
    id: number;
    classification: string;
    priority: string;
    department: string;
    subject: string;
    description: string;
    riskLevel: string;
    affectedArea: string;
    suggestedUrgency: string;
    impactScore: number;
    safetyConsiderations: string | null;
    environmentalImpact: string | null;
    affectedStakeholders: string | null;
    estimatedRepairCost: string | null;
    recommendedSolution: string | null;
    timelineEstimate: string | null;
    createdAt: Date;
  } | null;
  userName: string | null;
};

export default function CommunityMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<MapProblem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data: allProblems, isLoading, refetch } = trpc.map.allProblems.useQuery();

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently ignore if denied
      );
    }
  }, []);

  // Build SVG pin element for a given color
  const buildPinElement = useCallback((color: string, size = 36) => {
    const div = document.createElement("div");
    div.style.cursor = "pointer";
    div.innerHTML = `
      <svg width="${size}" height="${size + 8}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="3"/>
        <circle cx="18" cy="18" r="7" fill="white" fill-opacity="0.9"/>
        <path d="M18 34 L18 44" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
    return div;
  }, []);

  // Place markers on map
  const placeMarkers = useCallback((map: google.maps.Map, items: MapProblem[]) => {
    // Clear existing markers
    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];

    const filtered = activeFilter === "all"
      ? items
      : items.filter(i => i.problem.status === activeFilter);

    filtered.forEach(item => {
      const lat = parseFloat(item.problem.latitude ?? "");
      const lng = parseFloat(item.problem.longitude ?? "");
      if (isNaN(lat) || isNaN(lng)) return;

      const statusCfg = STATUS_CONFIG[item.problem.status] ?? STATUS_CONFIG.submitted;
      const pinEl = buildPinElement(statusCfg.pin);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: item.problem.title,
        content: pinEl,
      });

      marker.addListener("click", () => {
        setSelectedProblem(item);
        map.panTo({ lat, lng });
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filtered.forEach(item => {
        const lat = parseFloat(item.problem.latitude ?? "");
        const lng = parseFloat(item.problem.longitude ?? "");
        if (!isNaN(lat) && !isNaN(lng)) bounds.extend({ lat, lng });
      });
      if (!bounds.isEmpty()) map.fitBounds(bounds, 80);
    }
  }, [activeFilter, buildPinElement]);

  // Re-place markers when data or filter changes
  useEffect(() => {
    if (mapRef.current && allProblems && mapReady) {
      placeMarkers(mapRef.current, allProblems as MapProblem[]);
    }
  }, [allProblems, activeFilter, mapReady, placeMarkers]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
    // Center on user location if available
    if (userLocation) {
      map.setCenter(userLocation);
      map.setZoom(13);
    }
  }, [userLocation]);

  const problemsWithLocation = (allProblems as MapProblem[] | undefined)?.filter(
    p => p.problem.latitude && p.problem.longitude
  ) ?? [];

  const filteredCount = activeFilter === "all"
    ? problemsWithLocation.length
    : problemsWithLocation.filter(p => p.problem.status === activeFilter).length;

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Community Map</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${filteredCount} problem${filteredCount !== 1 ? "s" : ""} on map`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["all", "submitted", "in_progress", "resolved", "rejected"].map(f => {
              const cfg = f === "all" ? null : STATUS_CONFIG[f];
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? f === "all"
                        ? "bg-primary text-white border-primary"
                        : `${cfg!.bg} ${cfg!.color} ${cfg!.border}`
                      : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {f === "all" ? "All" : cfg!.label}
                </button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 px-2">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: cfg.pin }} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map + Side Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading community reports…</p>
              </div>
            </div>
          )}
          {problemsWithLocation.length === 0 && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center max-w-xs">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">No located problems yet</p>
                <p className="text-sm text-muted-foreground">Problems submitted with a location will appear here as markers.</p>
              </div>
            </div>
          )}
          <MapView
            className="w-full h-full"
            initialCenter={userLocation ?? { lat: 37.7749, lng: -122.4194 }}
            initialZoom={userLocation ? 13 : 11}
            onMapReady={handleMapReady}
          />
        </div>

        {/* Side Panel – full report */}
        {selectedProblem && (
          <div className="w-[380px] flex-shrink-0 border-l border-border bg-white overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-start justify-between z-10">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      STATUS_CONFIG[selectedProblem.problem.status]?.bg
                    } ${STATUS_CONFIG[selectedProblem.problem.status]?.color} ${
                      STATUS_CONFIG[selectedProblem.problem.status]?.border
                    }`}
                  >
                    {STATUS_CONFIG[selectedProblem.problem.status]?.label ?? selectedProblem.problem.status}
                  </span>
                  {selectedProblem.report && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        PRIORITY_CONFIG[selectedProblem.report.priority]?.bg
                      } ${PRIORITY_CONFIG[selectedProblem.report.priority]?.color}`}
                    >
                      {selectedProblem.report.priority}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {selectedProblem.problem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProblem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Meta */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Reported by <span className="font-medium text-foreground">{selectedProblem.userName ?? "Anonymous"}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(selectedProblem.problem.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono text-xs">
                    {parseFloat(selectedProblem.problem.latitude!).toFixed(5)}, {parseFloat(selectedProblem.problem.longitude!).toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Image */}
              {selectedProblem.problem.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img
                    src={selectedProblem.problem.imageUrl}
                    alt="Problem photo"
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Original Report</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedProblem.problem.description}</p>
              </div>

              {selectedProblem.report ? (
                <>
                  {/* AI Report */}
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">AI Analysis</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Classification</p>
                        <p className="font-semibold text-foreground capitalize">{selectedProblem.report.classification}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Department</p>
                        <p className="font-semibold text-foreground">{selectedProblem.report.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Affected Area</p>
                        <p className="font-semibold text-foreground">{selectedProblem.report.affectedArea}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Urgency</p>
                        <p className="font-semibold text-foreground">{selectedProblem.report.suggestedUrgency}</p>
                      </div>
                    </div>
                  </div>

                  {/* Impact Score */}
                  <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Impact Score</p>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-foreground">{selectedProblem.report.impactScore}</span>
                        <span className="text-sm text-muted-foreground mb-1">/100</span>
                      </div>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${
                      selectedProblem.report.impactScore >= 80 ? "text-red-500" :
                      selectedProblem.report.impactScore >= 60 ? "text-orange-500" :
                      selectedProblem.report.impactScore >= 40 ? "text-blue-500" : "text-green-500"
                    }`} />
                  </div>

                  {/* AI Description */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">AI Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedProblem.report.description}</p>
                  </div>

                  {/* Safety */}
                  {selectedProblem.report.safetyConsiderations && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <p className="text-xs font-semibold text-red-900">Safety Considerations</p>
                      </div>
                      <p className="text-sm text-red-800">{selectedProblem.report.safetyConsiderations}</p>
                    </div>
                  )}

                  {/* Environmental */}
                  {selectedProblem.report.environmentalImpact && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-semibold text-green-900">Environmental Impact</p>
                      </div>
                      <p className="text-sm text-green-800">{selectedProblem.report.environmentalImpact}</p>
                    </div>
                  )}

                  {/* Stakeholders */}
                  {selectedProblem.report.affectedStakeholders && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-900">Affected Stakeholders</p>
                      </div>
                      <p className="text-sm text-blue-800">{selectedProblem.report.affectedStakeholders}</p>
                    </div>
                  )}

                  {/* Cost & Timeline */}
                  {(selectedProblem.report.estimatedRepairCost || selectedProblem.report.timelineEstimate) && (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProblem.report.estimatedRepairCost && (
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Est. Cost</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{selectedProblem.report.estimatedRepairCost}</p>
                        </div>
                      )}
                      {selectedProblem.report.timelineEstimate && (
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Timeline</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{selectedProblem.report.timelineEstimate}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Solution */}
                  {selectedProblem.report.recommendedSolution && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recommended Solution</p>
                      <p className="text-sm text-foreground leading-relaxed">{selectedProblem.report.recommendedSolution}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">AI report not yet available for this problem.</p>
                </div>
              )}

              {/* Report to Submit */}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.href = "/submit"}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Report a Nearby Problem
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
