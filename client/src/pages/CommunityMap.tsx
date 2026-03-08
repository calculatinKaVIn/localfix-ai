import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import { ImageLoader } from "@/components/ImageLoader";
import { ImageModal } from "@/components/ImageModal";
import { ImageThumbnailGallery } from "@/components/ImageThumbnailGallery";
import { trpc } from "@/lib/trpc";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, X, AlertCircle, Loader2, TrendingUp, Calendar, User,
  Shield, Leaf, Users, DollarSign, Clock, Filter, RefreshCw, Layers, Wifi, WifiOff, CheckCircle2
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
  const problemsRef = useRef<MapProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<MapProblem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('fixed');

  const resolutionReasons = [
    { value: 'fixed', label: 'Fixed', description: 'Issue has been resolved' },
    { value: 'duplicate', label: 'Duplicate', description: 'Already reported elsewhere' },
    { value: 'invalid', label: 'Invalid', description: 'Not a valid issue' },
    { value: 'no_action_needed', label: 'No Action Needed', description: 'No action required' },
    { value: 'other', label: 'Other', description: 'Other reason' },
  ];

  const { data: allProblems, isLoading, refetch } = trpc.map.allProblems.useQuery({ status: activeFilter === 'all' ? undefined : activeFilter });
  const deleteProblemMutation = trpc.problems.deleteProblem.useMutation();

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently ignore if denied
      );
    }
  }, []);

  // Update problems ref when data changes
  useEffect(() => {
    if (allProblems) {
      problemsRef.current = allProblems as MapProblem[];
    }
  }, [allProblems]);

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

  // Handle real-time problem updates from WebSocket
  const handleProblemUpdate = useCallback((update: any) => {
    console.log("[CommunityMap] Received update:", update.type);
    
    if (update.type === "new_problem") {
      // Add new problem to the list
      const newProblem: MapProblem = {
        problem: update.problem,
        report: update.report,
        userName: null,
      };

      // Check if problem already exists
      const exists = problemsRef.current.some(p => p.problem.id === newProblem.problem.id);
      if (!exists) {
        problemsRef.current = [newProblem, ...problemsRef.current];
        
        // Re-place markers on map
        if (mapRef.current && mapReady) {
          placeMarkers(mapRef.current, problemsRef.current);
        }
        
        // Show toast notification
        toast.success(`New problem reported: ${newProblem.problem.title}`);
      }
    } else if (update.type === "problem_updated") {
      // Update existing problem
      const index = problemsRef.current.findIndex(p => p.problem.id === update.problem.id);
      if (index !== -1) {
        problemsRef.current[index] = {
          problem: update.problem,
          report: update.report,
          userName: problemsRef.current[index].userName,
        };
        
        // Re-place markers on map
        if (mapRef.current && mapReady) {
          placeMarkers(mapRef.current, problemsRef.current);
        }
        
        toast.info(`Problem updated: ${update.problem.title}`);
      }
    } else if (update.type === "problem_deleted") {
      // Remove deleted problem
      problemsRef.current = problemsRef.current.filter(p => p.problem.id !== update.problem.id);
      
      // Re-place markers on map
      if (mapRef.current && mapReady) {
        placeMarkers(mapRef.current, problemsRef.current);
      }
      
      if (selectedProblem?.problem.id === update.problem.id) {
        setSelectedProblem(null);
      }
      
      toast.info(`Problem removed: ${update.problem.title}`);
    }
  }, [mapReady, placeMarkers]);

  // Initialize WebSocket connection
  useWebSocket({
    onProblemUpdate: handleProblemUpdate,
    onConnect: () => {
      setWsConnected(true);
      console.log("[CommunityMap] WebSocket connected");
    },
    onDisconnect: () => {
      setWsConnected(false);
      console.log("[CommunityMap] WebSocket disconnected");
    },
    onError: (error) => {
      console.error("[CommunityMap] WebSocket error:", error);
    },
  });

  // Re-place markers when data or filter changes
  useEffect(() => {
    if (mapRef.current && allProblems && mapReady) {
      problemsRef.current = allProblems as MapProblem[];
      placeMarkers(mapRef.current, problemsRef.current);
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

  const problemsWithLocation = problemsRef.current?.filter(
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
      <div className="border-b border-border bg-background text-foreground px-6 py-4 flex-shrink-0 transition-colors duration-300">
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

          {/* Connection Status & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* WebSocket Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
              wsConnected 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
              {wsConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </>
              )}
            </div>

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
                        : `${cfg!.bg} ${cfg!.color} ${cfg!.border} dark:bg-opacity-20`
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 dark:bg-muted"
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
              <div className="bg-background/90 dark:bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center max-w-xs border border-border">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1 dark:text-foreground">No located problems yet</p>
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
          <div className="w-[380px] flex-shrink-0 border-l border-border bg-background text-foreground overflow-y-auto transition-colors duration-300">
            {/* Panel Header */}
            <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-start justify-between z-10 transition-colors duration-300">
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">{selectedProblem.problem.title}</h2>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={`${STATUS_CONFIG[selectedProblem.problem.status]?.bg} ${STATUS_CONFIG[selectedProblem.problem.status]?.color}`}>
                    {STATUS_CONFIG[selectedProblem.problem.status]?.label}
                  </Badge>
                  {selectedProblem.report && (
                    <Badge className={`${PRIORITY_CONFIG[selectedProblem.report.priority]?.bg} ${PRIORITY_CONFIG[selectedProblem.report.priority]?.color}`}>
                      {PRIORITY_CONFIG[selectedProblem.report.priority]?.label}
                    </Badge>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedProblem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-5 space-y-5">
              {/* Problem Description */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{selectedProblem.problem.description}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 dark:bg-muted rounded p-3 transition-colors duration-300">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Submitted
                  </p>
                  <p className="text-xs font-medium">{formatDate(selectedProblem.problem.createdAt)}</p>
                </div>
                {selectedProblem.report && (
                  <div className="bg-muted/50 dark:bg-muted rounded p-3 transition-colors duration-300">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Impact Score
                    </p>
                    <p className="text-sm font-bold text-primary">{selectedProblem.report.impactScore}/100</p>
                  </div>
                )}
              </div>

              {/* Resolution Reason (if resolved) */}
              {(selectedProblem.problem as any).resolutionReason && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 transition-colors duration-300">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Reason
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 capitalize">{(selectedProblem.problem as any).resolutionReason.replace(/_/g, ' ')}</p>
                  {(selectedProblem.problem as any).resolvedAt && (
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1">Resolved: {formatDate((selectedProblem.problem as any).resolvedAt)}</p>
                  )}
                </div>
              )}

              {/* Problem Image */}
              {selectedProblem.problem.imageUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Photo</p>
                  <button
                    onClick={() => {
                      setShowImageModal(true);
                      setSelectedImageIndex(0);
                    }}
                    className="w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <ImageLoader
                      src={selectedProblem.problem.imageUrl}
                      alt="Problem"
                      className="w-full rounded-lg cursor-pointer"
                      fallbackText="Unable to load problem image."
                      maxRetries={3}
                    />
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Click to view full size</p>
                </div>
              )}
              {!selectedProblem.problem.imageUrl && (
                <div className="bg-muted/50 dark:bg-muted rounded-lg p-4 text-center transition-colors duration-300">
                  <p className="text-sm text-muted-foreground">No image attached to this report</p>
                </div>
              )}

              {/* AI Report */}
              {selectedProblem.report && (
                <>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold mb-3">AI Analysis</p>
                    
                    <div className="space-y-3">
                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Classification</p>
                        <p className="text-sm font-medium capitalize">{selectedProblem.report.classification.replace(/_/g, " ")}</p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Department</p>
                        <p className="text-sm font-medium">{selectedProblem.report.department}</p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                        <p className="text-sm font-medium capitalize">{selectedProblem.report.riskLevel}</p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Affected Area</p>
                        <p className="text-sm font-medium">{selectedProblem.report.affectedArea}</p>
                      </div>
                    </div>
                  </div>

                  {/* Safety & Environmental */}
                  {selectedProblem.report.safetyConsiderations && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Safety Considerations
                      </p>
                      <p className="text-xs text-red-600">{selectedProblem.report.safetyConsiderations}</p>
                    </div>
                  )}

                  {selectedProblem.report.environmentalImpact && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" /> Environmental Impact
                      </p>
                      <p className="text-xs text-green-600">{selectedProblem.report.environmentalImpact}</p>
                    </div>
                  )}

                  {selectedProblem.report.affectedStakeholders && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Affected Stakeholders
                      </p>
                      <p className="text-xs text-blue-600">{selectedProblem.report.affectedStakeholders}</p>
                    </div>
                  )}

                  {selectedProblem.report.estimatedRepairCost && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Estimated Repair Cost
                      </p>
                      <p className="text-xs text-amber-600">{selectedProblem.report.estimatedRepairCost}</p>
                    </div>
                  )}

                  {selectedProblem.report.timelineEstimate && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Timeline Estimate
                      </p>
                      <p className="text-xs text-purple-600">{selectedProblem.report.timelineEstimate}</p>
                    </div>
                  )}

                  {selectedProblem.report.recommendedSolution && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Recommended Solution</p>
                      <p className="text-xs text-primary/80">{selectedProblem.report.recommendedSolution}</p>
                    </div>
                  )}
                </>
              )}

              {/* Resolve Report Button */}
              <div className="border-t border-border pt-4 mt-4">
                {!showResolveConfirm ? (
                  <Button
                    onClick={() => setShowResolveConfirm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolve Report
                  </Button>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Why are you resolving this report?</p>
                      <div className="space-y-2">
                        {resolutionReasons.map((reason) => (
                          <label key={reason.value} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="resolution-reason"
                              value={reason.value}
                              checked={selectedReason === reason.value}
                              onChange={(e) => setSelectedReason(e.target.value)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{reason.label}</p>
                              <p className="text-xs text-muted-foreground">{reason.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          setIsResolving(true);
                          try {
                            await deleteProblemMutation.mutateAsync({ problemId: selectedProblem.problem.id, resolutionReason: selectedReason });
                            setSelectedProblem(null);
                            setShowResolveConfirm(false);
                            toast.success("Report resolved and deleted successfully");
                            refetch();
                          } catch (error) {
                            toast.error("Failed to resolve report");
                          } finally {
                            setIsResolving(false);
                          }
                        }}
                        disabled={isResolving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Yes, Resolve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowResolveConfirm(false)}
                        variant="outline"
                        className="flex-1 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedProblem?.problem.imageUrl && (
          <ImageModal
            isOpen={showImageModal}
            images={[
              {
                url: selectedProblem.problem.imageUrl,
                title: selectedProblem.problem.title,
                description: selectedProblem.problem.description,
                uploadedAt: selectedProblem.problem.createdAt,
              },
            ]}
            currentIndex={selectedImageIndex}
            onClose={() => setShowImageModal(false)}
            onImageChange={setSelectedImageIndex}
          />
        )}
      </div>
    </div>
  );
}
