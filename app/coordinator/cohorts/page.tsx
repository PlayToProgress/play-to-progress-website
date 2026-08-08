"use client";

import { useEffect, useState } from "react";
import { Card, Input, Label, Select, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  numSessions: number;
  status: string;
}

export default function CohortsPage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    numSessions: 8,
    status: "planned",
  });

  function load() {
    setLoading(true);
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => setCohorts(d.cohorts))
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [showToast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/cohorts", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ name: "", startDate: "", endDate: "", numSessions: 8, status: "planned" });
      showToast("Cohort created.", "success");
      load();
    } catch (err) {
      const msg = errorMessage(err, "Failed to create cohort.");
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Cohorts</h1>
          <p className="text-white/50 text-sm">Set up programme runs and assign partner venues.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ New Cohort"}</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cohort name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Number of sessions</Label>
              <Input
                type="number"
                required
                value={form.numSessions}
                onChange={(e) => setForm({ ...form, numSessions: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End date</Label>
              <Input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Create Cohort
              </Button>
              {error && <span className="text-sm text-red-400">{error}</span>}
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="skeleton-gold rounded-lg h-40" />
      ) : cohorts.length === 0 ? (
        <p className="text-white/40">No cohorts yet. Create the first one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.map((c) => (
            <Card key={c._id}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">{c.name}</p>
                <Pill tone={c.status === "active" ? "green" : c.status === "completed" ? "gray" : "gold"}>
                  {c.status}
                </Pill>
              </div>
              <p className="text-xs text-white/40 mt-2">
                {new Date(c.startDate).toLocaleDateString("en-GB")} –{" "}
                {new Date(c.endDate).toLocaleDateString("en-GB")} · {c.numSessions} sessions
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
