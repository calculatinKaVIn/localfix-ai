import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, TrendingUp, BarChart3, PieChart, Map } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  PieChart as RechartsChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  stats: {
    totalProblems: number;
    submittedCount: number;
    inProgressCount: number;
    resolvedCount: number;
    rejectedCount: number;
    averageImpactScore: number;
  };
  classificationBreakdown: Array<{
    classification: string;
    count: number;
    percentage: number;
    averageImpactScore: number;
  }>;
  priorityBreakdown: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    averageImpactScore: number;
  }>;
  topIssues: Array<{
    title: string;
    count: number;
    impactScore: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    count: number;
    averageImpactScore: number;
  }>;
}

interface Pattern {
  pattern: string;
  severity: "low" | "medium" | "high";
  description: string;
  affectedCount: number;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Analytics() {
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = trpc.analytics.overview.useQuery();
  const { data: patterns, isLoading: patternsLoading, error: patternsError } = trpc.analytics.patterns.useQuery();

  const isLoading = analyticsLoading || patternsLoading;
  const error = analyticsError || patternsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4 flex items-center justify-center">
        <Card className="card-elegant p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
          <p className="text-muted-foreground">Failed to load analytics data. Please try again.</p>
        </Card>
      </div>
    );
  }

  const stats = analyticsData.stats;
  const resolutionRate = stats.totalProblems > 0
    ? Math.round(((stats.resolvedCount / stats.totalProblems) * 100))
    : 0;

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
    }
  };

  const getSeverityBadgeColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 py-12 px-4">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Track problem submission patterns and identify community issue trends
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Total Problems</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-4xl font-bold">{stats.totalProblems}</p>
            <p className="text-sm text-muted-foreground mt-2">Community reports submitted</p>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Resolution Rate</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-4xl font-bold">{resolutionRate}%</p>
            <p className="text-sm text-muted-foreground mt-2">{stats.resolvedCount} problems resolved</p>
          </Card>

          <Card className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Avg Impact Score</h3>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-4xl font-bold">{stats.averageImpactScore}</p>
            <p className="text-sm text-muted-foreground mt-2">Out of 100</p>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-elegant p-6">
            <h3 className="text-lg font-semibold mb-4">Problem Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalProblems > 0 ? (stats.submittedCount / stats.totalProblems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-sm">{stats.submittedCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-yellow-100 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalProblems > 0 ? (stats.inProgressCount / stats.totalProblems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-sm">{stats.inProgressCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalProblems > 0 ? (stats.resolvedCount / stats.totalProblems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-sm">{stats.resolvedCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-red-100 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalProblems > 0 ? (stats.rejectedCount / stats.totalProblems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-sm">{stats.rejectedCount}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="card-elegant p-6">
            <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsChart
                data={analyticsData.priorityBreakdown}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <Pie
                  data={analyticsData.priorityBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ priority, percentage }) => `${priority}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.priorityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Classification Breakdown */}
        <Card className="card-elegant p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Problem Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.classificationBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="classification" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Count" />
              <Bar dataKey="averageImpactScore" fill="#F59E0B" name="Avg Impact Score" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Time Series */}
        <Card className="card-elegant p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Submission Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Daily Submissions" />
              <Line type="monotone" dataKey="averageImpactScore" stroke="#F59E0B" name="Avg Impact Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Breakdown */}
        <Card className="card-elegant p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Department Workload</h3>
          <div className="space-y-4">
            {analyticsData.departmentBreakdown.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{dept.department}</p>
                  <p className="text-sm text-muted-foreground">{dept.count} issues assigned</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{dept.averageImpactScore}/100</p>
                  <p className="text-xs text-muted-foreground">Avg Impact</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Issues */}
        <Card className="card-elegant p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Reported Issues</h3>
          <div className="space-y-3">
            {analyticsData.topIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{issue.title}</p>
                  <p className="text-sm text-muted-foreground">{issue.count} reports</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600">{issue.impactScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Patterns & Insights */}
        {patterns && patterns.length > 0 && (
          <Card className="card-elegant p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Community Insights & Patterns
            </h3>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-lg ${getSeverityColor(pattern.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{pattern.pattern}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadgeColor(pattern.severity)}`}>
                      {pattern.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Affects {pattern.affectedCount} {pattern.affectedCount === 1 ? "issue" : "issues"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
