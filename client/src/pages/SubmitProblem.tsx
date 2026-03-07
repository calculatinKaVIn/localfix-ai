import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, MapPin, Sparkles, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/ImageUploadField";
import { useGeolocation } from "@/contexts/GeolocationContext";

interface GeneratedReport {
  classification: string;
  priority: string;
  department: string;
  subject: string;
  description: string;
  riskLevel: string;
  affectedArea: string;
  suggestedUrgency: string;
  impactScore: number;
  safetyConsiderations?: string;
  environmentalImpact?: string;
  affectedStakeholders?: string;
  estimatedRepairCost?: string;
  recommendedSolution?: string;
  timelineEstimate?: string;
}

export default function SubmitProblem() {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { requestLocation } = useGeolocation();

  // Load location from session storage if coming from interactive map, or request current location
  useEffect(() => {
    const storedLocation = sessionStorage.getItem("problemLocation");
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        sessionStorage.removeItem("problemLocation");
      } catch (error) {
        console.error("Error parsing location:", error);
      }
    } else if (!latitude && !longitude) {
      // Request current location if not already set
      requestLocation().then((loc) => {
        if (loc) {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
        }
      });
    }
  }, []);

  const submitMutation = trpc.problems.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Please describe the problem");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitMutation.mutateAsync({
        description: description.trim(),
        imageUrl: imageUrl || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      });

      setGeneratedReport(result.report);
      setProblemId(result.problemId);
      setDescription("");
      setImageUrl(null);
      toast.success("Problem submitted successfully!");
    } catch (error) {
      console.error("Error submitting problem:", error);
      toast.error("Failed to submit problem. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      default:
        return "text-green-600";
    }
  };

  if (generatedReport && problemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">Report Submitted Successfully!</h1>
            <p className="text-center text-muted-foreground text-lg">Your problem has been analyzed and routed to the appropriate department.</p>
          </div>

          <Card className="card-elegant p-8 mb-8">
            <div className="space-y-8">
              {/* Header Info */}
              <div className="border-b border-border pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Problem Type</p>
                    <p className="text-xl font-semibold">{generatedReport.classification}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="text-xl font-semibold">{generatedReport.department}</p>
                  </div>
                </div>
              </div>

              {/* Generated Report */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Generated Report
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                    <p className="text-base">{generatedReport.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-base whitespace-pre-wrap">{generatedReport.description}</p>
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Impact Score</p>
                  </div>
                  <p className="text-2xl font-bold">{generatedReport.impactScore}/100</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`w-4 h-4 ${getRiskColor(generatedReport.riskLevel)}`} />
                    <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  </div>
                  <p className={`text-lg font-semibold ${getRiskColor(generatedReport.riskLevel)}`}>{generatedReport.riskLevel}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Suggested Urgency</p>
                  </div>
                  <p className="text-sm font-semibold">{generatedReport.suggestedUrgency}</p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold mb-4">Detailed Analysis</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {generatedReport.safetyConsiderations && (
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="font-medium mb-2">Safety Considerations</p>
                      <p className="text-sm text-muted-foreground">{generatedReport.safetyConsiderations}</p>
                    </div>
                  )}
                  {generatedReport.environmentalImpact && (
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="font-medium mb-2">Environmental Impact</p>
                      <p className="text-sm text-muted-foreground">{generatedReport.environmentalImpact}</p>
                    </div>
                  )}
                  {generatedReport.affectedStakeholders && (
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="font-medium mb-2">Affected Stakeholders</p>
                      <p className="text-sm text-muted-foreground">{generatedReport.affectedStakeholders}</p>
                    </div>
                  )}
                  {generatedReport.estimatedRepairCost && (
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="font-medium mb-2">Estimated Repair Cost</p>
                      <p className="text-sm text-muted-foreground">{generatedReport.estimatedRepairCost}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {generatedReport.recommendedSolution && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="font-medium mb-2">Recommended Solution</p>
                  <p className="text-sm">{generatedReport.recommendedSolution}</p>
                </div>
              )}

              {generatedReport.timelineEstimate && (
                <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                  <p className="font-medium mb-2">Timeline Estimate</p>
                  <p className="text-sm">{generatedReport.timelineEstimate}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setGeneratedReport(null);
                setProblemId(null);
                setLatitude(null);
                setLongitude(null);
              }}
              className="btn-primary"
            >
              Report Another Problem
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/history"}>
              View My Reports
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Report a Problem</h1>
          <p className="text-lg text-muted-foreground">Describe the issue you found in your community. Our AI will analyze it and generate a professional report.</p>
        </div>

        <Card className="card-elegant p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Info */}
            {(latitude || longitude) && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Location Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {latitude?.toFixed(6)}, Longitude: {longitude?.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Problem Description</label>
              <Textarea
                placeholder="Describe the problem you found. For example: 'There is a large pothole near the school parking lot that could damage vehicles.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length} characters</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Photo (Optional)</label>
              <ImageUploadField onImageUpload={setImageUrl} />
              {imageUrl && (
                <div className="mt-4">
                  <img src={imageUrl} alt="Problem preview" className="max-h-48 rounded-lg" />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="btn-primary w-full" disabled={isLoading || !description.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Problem...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit & Analyze
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
