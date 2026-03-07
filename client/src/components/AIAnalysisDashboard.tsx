import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Zap, MapPin, Users, TrendingUp, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface AIAnalysisDashboardProps {
  title: string;
  description: string;
  category?: string;
  latitude?: string;
  longitude?: string;
}

export function AIAnalysisDashboard({
  title,
  description,
  category,
  latitude,
  longitude,
}: AIAnalysisDashboardProps) {
  // Using sonner toast for notifications
  const [activeTab, setActiveTab] = useState("analysis");
  const [isLoading, setIsLoading] = useState(false);

  // AI Analysis Queries
  const analyzeProblem = trpc.ai.analyzeProblem.useMutation();
  const generateReportFormats = trpc.ai.generateReportFormats.useMutation();
  const analyzeSafety = trpc.ai.analyzeSafety.useMutation();
  const generateCityInsights = trpc.ai.generateCityInsights.useMutation();
  const analyzeLocation = trpc.ai.analyzeLocation.useMutation();
  const askFollowUpQuestions = trpc.ai.askFollowUpQuestions.useMutation();

  const handleAnalyze = async () => {
    if (!title || !description) {
      toast.error("Please provide a title and description");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([
        analyzeProblem.mutateAsync({ title, description, latitude, longitude }),
        generateSafety(),
        generateInsights(),
        ...(latitude && longitude ? [analyzeLocationData()] : []),
      ]);

      toast.success("AI analysis has been generated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSafety = async () => {
    if (!category) return;
    await analyzeSafety.mutateAsync({ title, description, category });
  };

  const generateInsights = async () => {
    if (!category) return;
    await generateCityInsights.mutateAsync({
      title,
      description,
      category,
      latitude,
      longitude,
    });
  };

  const analyzeLocationData = async () => {
    if (!latitude || !longitude) return;
    await analyzeLocation.mutateAsync({ latitude, longitude });
  };

  const handleGenerateReports = async () => {
    if (!category) {
      toast.error("Please select a problem category first");
      return;
    }

    const department = analyzeProblem.data?.suggestedDepartment || "City Services";
    await generateReportFormats.mutateAsync({
      title,
      description,
      category,
      department,
    });
  };

  const handleFollowUpQuestions = async () => {
    if (!category) return;
    await askFollowUpQuestions.mutateAsync({ title, description, category });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Problem Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your problem report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || analyzeProblem.isPending}
                className="w-full"
              >
                {isLoading || analyzeProblem.isPending ? "Analyzing..." : "Run Analysis"}
              </Button>

              {analyzeProblem.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <Badge className="mt-1">{analyzeProblem.data.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Urgency Level</p>
                      <Badge
                        className="mt-1"
                        variant={
                          analyzeProblem.data.urgencyLevel === "critical"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {analyzeProblem.data.urgencyLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Danger Level</p>
                      <Badge
                        className="mt-1"
                        variant={
                          analyzeProblem.data.dangerLevel === "critical" ||
                          analyzeProblem.data.dangerLevel === "danger"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {analyzeProblem.data.dangerLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="mt-1 font-medium">
                        {analyzeProblem.data.suggestedDepartment}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Formal Report</p>
                    <p className="mt-2 text-sm text-gray-600">
                      {analyzeProblem.data.formalReport}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Safety Advice</p>
                    <ul className="mt-2 space-y-1">
                      {analyzeProblem.data.safetyAdvice.map((advice, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Repair Type</p>
                      <p className="mt-1 font-medium">
                        {analyzeProblem.data.estimatedRepairType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Repair Priority</p>
                      <Badge className="mt-1">
                        {analyzeProblem.data.repairPriority}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {analyzeProblem.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {analyzeProblem.error.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Formats</CardTitle>
              <CardDescription>
                Generate multiple report formats for different audiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateReports}
                disabled={generateReportFormats.isPending}
                className="w-full"
              >
                {generateReportFormats.isPending ? "Generating..." : "Generate Reports"}
              </Button>

              {generateReportFormats.data && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold">Email Format</p>
                    <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
                      <Streamdown>{generateReportFormats.data.emailFormat}</Streamdown>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Social Media Post</p>
                    <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
                      {generateReportFormats.data.socialMediaPost}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Phone Script</p>
                    <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
                      <Streamdown>{generateReportFormats.data.phoneScript}</Streamdown>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Engineering Description</p>
                    <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
                      <Streamdown>
                        {generateReportFormats.data.engineeringDescription}
                      </Streamdown>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyzeSafety.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeSafety.data.cyclistDanger
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm">Cyclist Danger</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeSafety.data.disabledPedestrianDanger
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm">Disabled Pedestrian Danger</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeSafety.data.nightVisibilityRisk
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm">Night Visibility Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeSafety.data.fireHazard ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm">Fire Hazard</span>
                    </div>
                  </div>

                  {analyzeSafety.data.temporaryWarnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">Temporary Warnings</p>
                      <ul className="mt-2 space-y-1">
                        {analyzeSafety.data.temporaryWarnings.map((warning, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analyzeSafety.data.routeAlternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">Route Alternatives</p>
                      <ul className="mt-2 space-y-1">
                        {analyzeSafety.data.routeAlternatives.map((alt, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            • {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                City Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generateCityInsights.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded bg-blue-50 p-3">
                      <p className="text-xs text-gray-600">Similar Problems Nearby</p>
                      <p className="mt-1 text-2xl font-bold">
                        {generateCityInsights.data.similarProblemsNearby}
                      </p>
                    </div>
                    <div className="rounded bg-purple-50 p-3">
                      <p className="text-xs text-gray-600">Maintenance Priority</p>
                      <p className="mt-1 font-semibold">
                        {generateCityInsights.data.maintenancePriority}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Improvement Ideas</p>
                    <ul className="mt-2 space-y-1">
                      {generateCityInsights.data.improvementIdeas.map((idea, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          • {idea}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Estimated Repair Cost</p>
                      <p className="mt-1 font-medium">
                        {generateCityInsights.data.estimatedRepairCost}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Estimated Repair Time</p>
                      <p className="mt-1 font-medium">
                        {generateCityInsights.data.estimatedRepairTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyzeLocation.data && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="mt-1 font-medium">{analyzeLocation.data.district}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Nearest Government Office</p>
                    <p className="mt-1 font-medium">
                      {analyzeLocation.data.nearestGovernmentOffice}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeLocation.data.nearSchoolZone
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm">Near School Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          analyzeLocation.data.nearHospital
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm">Near Hospital</span>
                    </div>
                  </div>

                  {analyzeLocation.data.landmarks.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">Nearby Landmarks</p>
                      <ul className="mt-2 space-y-1">
                        {analyzeLocation.data.landmarks.map((landmark, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            • {landmark}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
