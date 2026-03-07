import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Calendar, MapPin, TrendingUp, Clock, AlertCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import ImageGallery from "@/components/ImageGallery";
import { useLocation } from "wouter";

type StatusType = "submitted" | "in_progress" | "resolved" | "rejected";
type SortOption = "newest" | "oldest" | "priority";
type FilterStatus = "all" | StatusType;

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const { data: problems, isLoading, error } = trpc.problems.myProblems.useQuery();
  const { data: selectedProblem } = trpc.problems.getById.useQuery(
    { id: selectedProblemId! },
    { enabled: !!selectedProblemId }
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: StatusType) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  const getImpactScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600 dark:text-red-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  // Filter and sort problems
  let filteredProblems = problems || [];
  if (filterStatus !== "all") {
    filteredProblems = filteredProblems.filter((p) => p.problem.status === filterStatus);
  }

  if (sortBy === "newest") {
    filteredProblems = [...filteredProblems].sort(
      (a, b) => new Date(b.problem.createdAt).getTime() - new Date(a.problem.createdAt).getTime()
    );
  } else if (sortBy === "oldest") {
    filteredProblems = [...filteredProblems].sort(
      (a, b) => new Date(a.problem.createdAt).getTime() - new Date(b.problem.createdAt).getTime()
    );
  } else if (sortBy === "priority") {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filteredProblems = [...filteredProblems].sort(
      (a, b) => (priorityOrder[a.report?.priority as keyof typeof priorityOrder] ?? 4) - 
                 (priorityOrder[b.report?.priority as keyof typeof priorityOrder] ?? 4)
    );
  }

  // Calculate statistics
  const stats = {
    total: problems?.length || 0,
    submitted: problems?.filter((p) => p.problem.status === "submitted").length || 0,
    in_progress: problems?.filter((p) => p.problem.status === "in_progress").length || 0,
    resolved: problems?.filter((p) => p.problem.status === "resolved").length || 0,
    rejected: problems?.filter((p) => p.problem.status === "rejected").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <Card className="card-elegant p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground">Failed to load your profile. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
      <div className="container max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="card-elegant p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name || "User"}</h1>
                  <p className="text-muted-foreground mb-4 flex items-center gap-2">
                    <span>📧</span> {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Unknown"}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="card-elegant p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Reports</p>
          </Card>
          <Card className="card-elegant p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 mb-1">{stats.submitted}</p>
            <p className="text-sm text-muted-foreground">Submitted</p>
          </Card>
          <Card className="card-elegant p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.in_progress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </Card>
          <Card className="card-elegant p-4 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </Card>
          <Card className="card-elegant p-4 text-center">
            <p className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Problems List */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Your Reports</h2>
              
              {/* Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>

            {filteredProblems.length === 0 ? (
              <Card className="card-elegant p-6 text-center">
                <p className="text-muted-foreground">No problems found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredProblems.map((item) => (
                  <Card
                    key={item.problem.id}
                    className={`card-elegant p-4 cursor-pointer transition-all ${
                      selectedProblemId === item.problem.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedProblemId(item.problem.id)}
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{item.problem.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.problem.status as StatusType)}`}>
                          {getStatusLabel(item.problem.status as StatusType)}
                        </span>
                        {item.report && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.report.priority)}`}>
                            {item.report.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.problem.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Problem Details */}
          <div className="md:col-span-2">
            {selectedProblem ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedProblem.problem.title}</h2>
                  <p className="text-muted-foreground">{selectedProblem.problem.description}</p>
                </div>

                {/* Status and Metadata */}
                <Card className="card-elegant p-6">
                  <h3 className="text-lg font-semibold mb-4">Report Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProblem.problem.status as StatusType)}`}>
                        {getStatusLabel(selectedProblem.problem.status as StatusType)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                      <p className="font-medium">{format(new Date(selectedProblem.problem.createdAt), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                  </div>
                </Card>

                {/* Problem Image */}
                {selectedProblem.problem.imageUrl && (
                  <ImageGallery
                    images={[selectedProblem.problem.imageUrl]}
                    title="Problem Photo"
                  />
                )}

                {/* AI Generated Report */}
                {selectedProblem.report && (
                  <>
                    <Card className="card-elegant p-6">
                      <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Classification</p>
                          <p className="font-semibold capitalize">
                            {selectedProblem.report.classification.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Priority</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProblem.report.priority)}`}>
                            {selectedProblem.report.priority.charAt(0).toUpperCase() +
                              selectedProblem.report.priority.slice(1)}
                          </span>
                        </div>
                        <div className="bg-background rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Department</p>
                          <p className="font-semibold">{selectedProblem.report.department}</p>
                        </div>
                        <div className="bg-background rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                          <p className="font-semibold capitalize">{selectedProblem.report.riskLevel}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="card-elegant p-6">
                      <h3 className="text-lg font-semibold mb-4">Generated Report</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{selectedProblem.report.subject}</h4>
                          <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              Affected Area
                            </p>
                            <p className="font-medium">{selectedProblem.report.affectedArea}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Suggested Urgency
                            </p>
                            <p className="font-medium">{selectedProblem.report.suggestedUrgency}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Impact Score */}
                    <Card className="card-elegant p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Impact Score
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedProblem.report.impactScore >= 70
                              ? "High impact - Urgent attention needed"
                              : selectedProblem.report.impactScore >= 40
                                ? "Medium impact - Should be addressed soon"
                                : "Low impact - Can be scheduled"}
                          </p>
                        </div>
                        <div className={`text-5xl font-bold ${getImpactScoreColor(selectedProblem.report.impactScore)}`}>
                          {selectedProblem.report.impactScore}
                        </div>
                      </div>
                    </Card>

                    {/* Enhanced Analysis Fields */}
                    {selectedProblem.report.detailedAnalysis && (
                      <Card className="card-elegant p-6">
                        <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
                        <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.detailedAnalysis}</p>
                      </Card>
                    )}

                    {selectedProblem.report.safetyConsiderations && (
                      <Card className="card-elegant p-6 border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          Safety Considerations
                        </h3>
                        <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.safetyConsiderations}</p>
                      </Card>
                    )}

                    {selectedProblem.report.environmentalImpact && (
                      <Card className="card-elegant p-6">
                        <h3 className="text-lg font-semibold mb-4">Environmental Impact</h3>
                        <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.environmentalImpact}</p>
                      </Card>
                    )}

                    {selectedProblem.report.affectedStakeholders && (
                      <Card className="card-elegant p-6">
                        <h3 className="text-lg font-semibold mb-4">Affected Stakeholders</h3>
                        <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.affectedStakeholders}</p>
                      </Card>
                    )}

                    {selectedProblem.report.recommendedSolution && (
                      <Card className="card-elegant p-6 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10">
                        <h3 className="text-lg font-semibold mb-4">Recommended Solution</h3>
                        <p className="text-foreground/80 leading-relaxed">{selectedProblem.report.recommendedSolution}</p>
                      </Card>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Card className="card-elegant p-12 text-center">
                <p className="text-lg text-muted-foreground">Select a problem to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
