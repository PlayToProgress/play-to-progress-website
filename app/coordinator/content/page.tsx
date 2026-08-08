"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Select, Label, Input, Textarea } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
  numSessions: number;
}
interface Material {
  type: "pdf" | "video" | "link" | "image";
  title: string;
  url: string;
}
interface Content {
  _id: string;
  weekNumber: number;
  title: string;
  theme: string;
  description: string;
  materials: Material[];
}

export default function ContentPage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [form, setForm] = useState({ weekNumber: 1, title: "", theme: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => {
        setCohorts(d.cohorts);
        if (d.cohorts[0]) setCohortId(d.cohorts[0]._id);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")));
  }, [showToast]);

  const loadContent = useCallback(
    (cid: string) => {
      apiFetch<{ content: Content[] }>(`/api/content?cohortId=${cid}`)
        .then((d) => setContent(d.content))
        .catch((err) => showToast(errorMessage(err, "Couldn't load session content.")));
    },
    [showToast]
  );

  useEffect(() => {
    if (cohortId) loadContent(cohortId);
  }, [cohortId, loadContent]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/content", {
        method: "POST",
        body: JSON.stringify({ ...form, cohortId, materials: [] }),
      });
      setForm({ weekNumber: form.weekNumber + 1, title: "", theme: "", description: "" });
      showToast("Week saved.", "success");
      loadContent(cohortId);
    } catch (err) {
      showToast(errorMessage(err, "Couldn't save this week's content."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Session Content</h1>
      <p className="text-white/50 text-sm mb-6">
        Upload and organise materials mapped to each week of the programme.
      </p>

      <div className="max-w-xs mb-6">
        <Label>Cohort</Label>
        <Select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
          {cohorts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mb-8">
        <p className="font-display font-bold mb-4">Add / update a week</p>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Week number</Label>
            <Input
              type="number"
              min={1}
              required
              value={form.weekNumber}
              onChange={(e) => setForm({ ...form, weekNumber: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Theme</Label>
            <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={saving}>
              Save Week
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((c) => (
          <Card key={c._id}>
            <p className="text-xs uppercase tracking-wider text-gold">Week {c.weekNumber} · {c.theme}</p>
            <p className="font-display text-lg font-bold mt-1">{c.title}</p>
            <p className="text-sm text-white/50 mt-2">{c.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
