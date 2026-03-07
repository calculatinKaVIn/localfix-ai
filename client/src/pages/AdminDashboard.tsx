import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ImageGallery from "@/components/ImageGallery";

type StatusType = "submitted" | "in_progress" | "resolved" | "rejected";

export default function AdminDashboard() {
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const { data: allProblems, isLoading, error, refetch } = trpc.admin.allProblems.useQuery({
    limit,
    offset,
  });

  const { data: selectedProblem } = trpc.admin.allProblems.useQuery(
    { limit: 1, offset: 0 },
    { enabled: false }
  );

  const updateStatusMutation = trpc.admin.updateStatus.useMutation();
  const deleteMutation = trpc.admin.deleteProblem.useMutation();

  const handleStatusChange = async (problemId: number, newStatus: StatusType) => {
    try {
      await updateStatusMutation.mutateAsync({
        problemId,
        status: newStatus,
      });
      toast.success("Status updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (problemId: number) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      await deleteMutation.mutateAsync({ problemId });
      toast.success("Problem deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete problem");
    }
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

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <Card className="card-elegant p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Problems</h2>
          <p className="text-muted-foreground">Failed to load problems. Please try again.</p>
        </Card>
      </div>
    );
  }

  const totalProblems = Array.isArray(allProblems) ? allProblems.length : 0;
  const problems = Array.isArray(allProblems) ? allProblems : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage and track all community problem reports
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="card-elegant p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
            <p className="text-3xl font-bold">{totalProblems}</p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-sm text-muted-foreground mb-1">Submitted</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {problems.filter((p: any) => p.problem.status === "submitted").length}
            </p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {problems.filter((p: any) => p.problem.status === "in_progress").length}
            </p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {problems.filter((p: any) => p.problem.status === "resolved").length}
            </p>
          </Card>
        </div>

        {/* Problems Table */}
        <Card className="card-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Image</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Problem</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Impact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Submitted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                      No problems found
                    </td>
                  </tr>
                ) : (
                  problems.map((item: any) => (
                    <tr key={item.problem.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        {item.problem.imageUrl ? (
                          <img
                            src={item.problem.imageUrl}
                            alt="Problem thumbnail"
                            className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium line-clamp-1">{item.problem.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {item.problem.userId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.report ? (
                          <span className="text-sm capitalize">
                            {item.report.classification.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.report ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.report.priority)}`}>
                            {item.report.priority}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={item.problem.status}
                          onValueChange={(value) =>
                            handleStatusChange(item.problem.id, value as StatusType)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        {item.report ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${item.report.impactScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {item.report.impactScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(item.problem.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.problem.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1} to {Math.min(offset + limit, totalProblems)} of {totalProblems}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + limit >= totalProblems}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
