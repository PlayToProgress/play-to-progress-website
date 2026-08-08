"use client";

import { useEffect, useState } from "react";
import { Card, Select, Label } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch, apiDownload } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
}

export default function ReportsPage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => setCohorts(d.cohorts))
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")));
  }, [showToast]);

  async function download(path: string, filename: string) {
    setDownloading(path);
    try {
      const url = cohortId ? `${path}?cohortId=${cohortId}` : path;
      await apiDownload(url, filename);
    } catch (err) {
      showToast(errorMessage(err, "Couldn't generate the report."));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Funder Reports</h1>
      <p className="text-white/50 text-sm mb-6">
        Auto-generated, ready to submit to the London City Airport Community Fund.
      </p>

      <div className="max-w-xs mb-6">
        <Label>Cohort (optional — leave blank for all)</Label>
        <Select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
          <option value="">All cohorts</option>
          {cohorts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="font-display text-lg font-bold mb-1">Funder Impact Report</p>
          <p className="text-sm text-white/50 mb-4">
            Participant counts, attendance rates, demographic breakdown, and outcome metrics (CR-05).
          </p>
          <Button
            loading={downloading === "/api/reports/funder"}
            onClick={() => download("/api/reports/funder", "play-to-progress-funder-report.pdf")}
          >
            Download PDF
          </Button>
        </Card>
        <Card>
          <p className="font-display text-lg font-bold mb-1">Funder Evidence Pack</p>
          <p className="text-sm text-white/50 mb-4">
            One-click export combining attendance, testimonials, and outcomes for the LCA fund (DS-06).
          </p>
          <Button
            loading={downloading === "/api/reports/evidence-pack"}
            onClick={() =>
              download("/api/reports/evidence-pack", "play-to-progress-funder-evidence-pack.pdf")
            }
          >
            Download PDF
          </Button>
        </Card>
      </div>
    </div>
  );
}
