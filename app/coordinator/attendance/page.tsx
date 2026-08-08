"use client";

import { useEffect, useState } from "react";
import { Card, Select, Label, Input, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
  numSessions: number;
}
interface Participant {
  _id: string;
  name: string;
}
interface AttendanceRecord {
  participantId: string;
  status: "present" | "absent" | "late";
  notes?: string;
}

export default function AttendancePage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [sessionNumber, setSessionNumber] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [records, setRecords] = useState<Record<string, "present" | "absent" | "late">>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => {
        setCohorts(d.cohorts);
        if (d.cohorts[0]) setCohortId(d.cohorts[0]._id);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")));
  }, [showToast]);

  useEffect(() => {
    if (!cohortId) return;
    apiFetch<{ participants: Participant[] }>(`/api/participants?cohortId=${cohortId}`)
      .then((d) => setParticipants(d.participants))
      .catch((err) => showToast(errorMessage(err, "Couldn't load participants.")));
    apiFetch<{ attendance: AttendanceRecord[] }>(
      `/api/attendance?cohortId=${cohortId}&sessionNumber=${sessionNumber}`
    )
      .then((d) => {
        const map: Record<string, "present" | "absent" | "late"> = {};
        d.attendance.forEach((a) => (map[a.participantId] = a.status));
        setRecords(map);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load attendance records.")));
  }, [cohortId, sessionNumber, showToast]);

  async function mark(participantId: string, status: "present" | "absent" | "late") {
    setSaving(`${participantId}:${status}`);
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ cohortId, participantId, sessionNumber, date, status }),
      });
      setRecords((r) => ({ ...r, [participantId]: status }));
    } catch (err) {
      showToast(errorMessage(err, "Couldn't save attendance."));
    } finally {
      setSaving(null);
    }
  }

  const activeCohort = cohorts.find((c) => c._id === cohortId);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Attendance</h1>
      <p className="text-white/50 text-sm mb-6">
        Marking a participant &quot;present&quot; automatically stamps their Journey Card.
      </p>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Cohort</Label>
            <Select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
              {cohorts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Session number</Label>
            <Select value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))}>
              {Array.from({ length: activeCohort?.numSessions ?? 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Session {n}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="card-surface rounded-lg divide-y divide-white/5">
        {participants.length === 0 && (
          <p className="p-6 text-white/40 text-sm">No participants in this cohort yet.</p>
        )}
        {participants.map((p) => {
          const status = records[p._id];
          return (
            <div key={p._id} className="flex items-center justify-between p-4">
              <p className="font-medium">{p.name}</p>
              <div className="flex items-center gap-2">
                {status && (
                  <Pill tone={status === "present" ? "green" : status === "late" ? "gold" : "red"}>
                    {status}
                  </Pill>
                )}
                <div className="flex gap-1">
                  {(["present", "late", "absent"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={status === s ? "gold" : "outline"}
                      className="text-xs px-3 py-1.5"
                      loading={saving === `${p._id}:${s}`}
                      disabled={saving !== null && saving !== `${p._id}:${s}`}
                      onClick={() => mark(p._id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
