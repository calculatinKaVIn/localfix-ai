import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

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
}

export default function SubmitProblem() {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);

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
      });

      setGeneratedReport(result.report);
      setProblemId(result.problemId);
      setDescription("");
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
        return "badge-error";
      case "high":
        return "badge-warning";
      case "medium":
        return "badge-info";
      default:
        return "badge-success";
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getImpactScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600 dark:text-red-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  if (generatedReport && problemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
        <div className="container max-w-4xl">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Report Generated Successfully</h1>
            <p className="text-lg text-muted-foreground">
              Your problem has been analyzed and is ready to submit to the city
            </p>
          </div>

          {/* Generated Report */}
          <div className="space-y-6">
            {/* Classification & Priority */}
            <Card className="card-elegant p-6">
              <h2 className="text-2xl font-semibold mb-4">Problem Classification</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold capitalize">{generatedReport.classification.replace(/_/g, " ")}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(generatedReport.priority)}`}>
                    {generatedReport.priority.charAt(0).toUpperCase() + generatedReport.priority.slice(1)}
                  </span>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-semibold">{generatedReport.department}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                  <p className={`font-semibold capitalize ${getRiskLevelColor(generatedReport.riskLevel)}`}>
                    {generatedReport.riskLevel}
                  </p>
                </div>
              </div>
            </Card>

            {/* Report Content */}
            <Card className="card-elegant p-6">
              <h2 className="text-2xl font-semibold mb-4">Report Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{generatedReport.subject}</h3>
                  <p className="text-foreground/80 leading-relaxed">{generatedReport.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Affected Area</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                      <p className="font-medium">{generatedReport.affectedArea}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Suggested Urgency</p>
                    <p className="font-medium">{generatedReport.suggestedUrgency}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Impact Score */}
            <Card className="card-elegant p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <h2 className="text-2xl font-semibold mb-4">Impact Assessment</h2>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getImpactScoreColor(generatedReport.impactScore)}`}>
                    {generatedReport.impactScore}
                  </div>
                  <p className="text-lg text-muted-foreground">Impact Score</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {generatedReport.impactScore >= 70
                      ? "High impact - Urgent attention needed"
                      : generatedReport.impactScore >= 40
                        ? "Medium impact - Should be addressed soon"
                        : "Low impact - Can be scheduled"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-4">
              <Button
                onClick={() => {
                  setGeneratedReport(null);
                  setProblemId(null);
                }}
                variant="outline"
                size="lg"
              >
                Submit Another Problem
              </Button>
              <Button size="lg" className="btn-primary">
                View in History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Report a City Problem</h1>
          <p className="text-xl text-muted-foreground">
            Describe the issue you've found in your community. Our AI will analyze it and prepare a professional report.
          </p>
        </div>

        {/* Form Card */}
        <Card className="card-elegant p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold mb-3">
                Problem Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe the problem in detail. For example: 'There is a large pothole near the school parking lot entrance that could damage vehicles. It's about 2 feet wide and 6 inches deep.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="input-elegant min-h-32 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {description.length}/2000 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-secondary mb-1">AI-Powered Analysis</p>
                <p className="text-foreground/80">
                  Our AI will automatically classify the problem, assign a priority level, suggest the appropriate city department, and calculate an impact score.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !description.trim()}
              size="lg"
              className="w-full btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Problem...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </form>
        </Card>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">AI Classification</h3>
            <p className="text-sm text-muted-foreground">Automatic problem type detection and categorization</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-semibold mb-2">Professional Reports</h3>
            <p className="text-sm text-muted-foreground">Ready-to-submit reports for city departments</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Impact Scoring</h3>
            <p className="text-sm text-muted-foreground">Severity assessment and urgency timeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
