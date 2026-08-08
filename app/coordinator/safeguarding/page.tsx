"use client";

import { useEffect, useState } from "react";
import { Card, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface CheckIn {
  _id: string;
  mood: number;
  comment?: string;
  sessionNumber: number;
  flagged: boolean;
  resolvedByCoordinator: boolean;
  createdAt: string;
  participantId: { name: string };
}

export default function SafeguardingPage() {
  const { showToast } = useToast();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<{ checkIns: CheckIn[] }>(`/api/checkins?flagged=${!showAll}`)
      .then((d) => setCheckIns(d.checkIns))
      .catch((err) => showToast(errorMessage(err, "Couldn't load check-ins.")))
      .finally(() => setLoading(false));
  }
  useEffect(load, [showAll, showToast]);

  async function resolve(id: string) {
    setBusyId(id);
    try {
      await apiFetch(`/api/checkins/${id}`, { method: "PATCH" });
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't mark this as resolved."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Safeguarding</h1>
          <p className="text-white/50 text-sm">
            Wellbeing check-ins with a low mood score are flagged automatically for review.
          </p>
        </div>
        <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show flagged only" : "Show all check-ins"}
        </Button>
      </div>

      {loading ? (
        <div className="skeleton-gold rounded-lg h-40" />
      ) : checkIns.length === 0 ? (
        <p className="text-white/40">No flagged check-ins right now.</p>
      ) : (
        <div className="space-y-3">
          {checkIns.map((c) => (
            <Card key={c._id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {c.participantId?.name} — Session {c.sessionNumber}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Mood: {c.mood}/5 {c.comment && `· "${c.comment}"`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {c.flagged && <Pill tone="red">flagged</Pill>}
                {c.resolvedByCoordinator ? (
                  <Pill tone="green">resolved</Pill>
                ) : (
                  <Button
                    className="text-xs px-3 py-1.5"
                    loading={busyId === c._id}
                    onClick={() => resolve(c._id)}
                  >
                    Mark resolved
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
