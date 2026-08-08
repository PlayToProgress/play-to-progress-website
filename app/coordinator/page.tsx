"use client";

import { useEffect, useState } from "react";
import { StatCard, Card } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Metrics {
  totalEnrolments: number;
  sessionAttendanceRate: number;
  badgesAwarded: number;
  projectsSubmitted: number;
  projectsApproved: number;
  journeysCompleted: number;
  unresolvedSafeguardingFlags: number;
}

export default function CoordinatorDashboard() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    apiFetch<Metrics>("/api/reports/metrics")
      .then(setMetrics)
      .catch((err) => showToast(errorMessage(err, "Couldn't load dashboard metrics.")));
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Programme Dashboard</h1>
      <p className="text-white/50 text-sm mb-8">Real-time metrics across all cohorts.</p>

      {!metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-gold rounded-lg h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Enrolments" value={metrics.totalEnrolments} />
          <StatCard label="Attendance Rate" value={`${metrics.sessionAttendanceRate}%`} />
          <StatCard label="Badges Awarded" value={metrics.badgesAwarded} />
          <StatCard label="Projects Submitted" value={metrics.projectsSubmitted} />
          <StatCard label="Projects Approved" value={metrics.projectsApproved} />
          <StatCard label="Journeys Completed" value={metrics.journeysCompleted} sub="10/10 stamps" />
          <StatCard
            label="Safeguarding Flags"
            value={metrics.unresolvedSafeguardingFlags}
            sub="Unresolved check-ins"
          />
        </div>
      )}

      <Card className="mt-8">
        <p className="font-display text-lg font-bold mb-2">Quick actions</p>
        <p className="text-sm text-white/50">
          Use the sidebar to set up a cohort, register participants, mark attendance, upload
          session content, approve projects for the public showcase, or export funder reports.
        </p>
      </Card>
    </div>
  );
}
