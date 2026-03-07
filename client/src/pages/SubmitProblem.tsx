import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, MapPin, Sparkles, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/ImageUploadField";

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

  // Load location from session storage if coming from interactive map
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

  const getImpactColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-blue-600";
    return "text-green-600";
  };

  const getImpactBgColor = (score: number) => {
    if (score >= 80) return "bg-red-50";
    if (score >= 60) return "bg-orange-50";
    if (score >= 40) return "bg-blue-50";
    return "bg-green-50";
  };

  if (generatedReport && problemId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Problem Submitted Successfully</h1>
            <p className="text-muted-foreground">Your report has been analyzed and routed to the appropriate department</p>
          </div>

          {/* AI-Generated Report Card */}
          <Card className="card-elegant p-6 mb-6 border-green-200 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">AI-Generated Analysis</h2>
            </div>

            {/* Priority & Classification */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Classification</p>
                <p className="text-lg font-semibold text-foreground capitalize">{generatedReport.classification}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(generatedReport.priority)} capitalize`}>
                  {generatedReport.priority}
                </span>
              </div>
            </div>

            {/* Subject & Department */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">Subject</p>
              <h3 className="text-lg font-semibold text-foreground mb-4">{generatedReport.subject}</h3>
              <p className="text-sm text-muted-foreground mb-2">Routed to Department</p>
              <p className="text-base font-medium text-primary">{generatedReport.department}</p>
            </div>

            {/* Impact Score */}
            <div className={`${getImpactBgColor(generatedReport.impactScore)} rounded-lg p-4 mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Impact Score</p>
                  <p className={`text-3xl font-bold ${getImpactColor(generatedReport.impactScore)}`}>
                    {generatedReport.impactScore}/100
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${getImpactColor(generatedReport.impactScore)}`} />
              </div>
            </div>

            {/* Risk Level & Urgency */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Risk Level</p>
                <p className="font-semibold text-foreground capitalize">{generatedReport.riskLevel}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Suggested Urgency</p>
                <p className="font-semibold text-foreground">{generatedReport.suggestedUrgency}</p>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">Detailed Description</p>
              <p className="text-foreground leading-relaxed">{generatedReport.description}</p>
            </div>

            {/* Additional Analysis */}
            {(generatedReport.safetyConsiderations || generatedReport.environmentalImpact || generatedReport.affectedStakeholders) && (
              <div className="grid gap-4">
                {generatedReport.safetyConsiderations && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-semibold text-red-900 mb-2">🛡️ Safety Considerations</p>
                    <p className="text-sm text-red-800">{generatedReport.safetyConsiderations}</p>
                  </div>
                )}
                {generatedReport.environmentalImpact && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">🌱 Environmental Impact</p>
                    <p className="text-sm text-green-800">{generatedReport.environmentalImpact}</p>
                  </div>
                )}
                {generatedReport.affectedStakeholders && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-2">Affected Stakeholders</p>
                        <p className="text-sm text-blue-800">{generatedReport.affectedStakeholders}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cost & Timeline */}
            {(generatedReport.estimatedRepairCost || generatedReport.timelineEstimate) && (
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                {generatedReport.estimatedRepairCost && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    </div>
                    <p className="font-semibold text-foreground">{generatedReport.estimatedRepairCost}</p>
                  </div>
                )}
                {generatedReport.timelineEstimate && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Timeline</p>
                    </div>
                    <p className="font-semibold text-foreground">{generatedReport.timelineEstimate}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setGeneratedReport(null);
                setProblemId(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Submit Another Problem
            </Button>
            <Button
              onClick={() => window.location.href = "/history"}
              className="flex-1"
            >
              View My Reports
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Report a Problem</h1>
          <p className="text-muted-foreground">Describe the issue you've found in your community. Our AI will analyze it and route it to the appropriate department.</p>
        </div>

        {/* Main Form Card */}
        <Card className="card-elegant p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Info */}
            {latitude && longitude && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Location Selected</p>
                  <p className="text-xs text-blue-800 mt-1">Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                </div>
              </div>
            )}

            {/* Problem Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Problem Description
                <span className="text-destructive ml-1">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail. For example: 'There is a large pothole on Main Street near the school parking lot. It's about 2 feet wide and could damage vehicles.'"
                className="min-h-32 resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 characters
              </p>
            </div>

            {/* Image Upload */}
            <ImageUploadField
              onImageUpload={setImageUrl}
              isLoading={isLoading}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit & Analyze with AI
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elegant p-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">AI Analysis</p>
                <p className="text-xs text-blue-800 mt-1">Automatic classification and impact scoring</p>
              </div>
            </div>
          </Card>
          <Card className="card-elegant p-4 bg-green-50/50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">Smart Routing</p>
                <p className="text-xs text-green-800 mt-1">Sent to the right department automatically</p>
              </div>
            </div>
          </Card>
          <Card className="card-elegant p-4 bg-purple-50/50 border-purple-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-purple-900">Track Progress</p>
                <p className="text-xs text-purple-800 mt-1">Monitor your report status anytime</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
