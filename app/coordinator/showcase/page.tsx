"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Input, Label, Select, Textarea, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
}
interface ShowcaseEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  published: boolean;
}

export default function ShowcaseManagePage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [events, setEvents] = useState<ShowcaseEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    cohortId: "",
    title: "",
    description: "",
    date: "",
    location: "Shipman Youth Zone, Newham",
    published: true,
  });

  const load = useCallback(() => {
    apiFetch<{ events: ShowcaseEvent[] }>("/api/showcase/events")
      .then((d) => setEvents(d.events))
      .catch((err) => showToast(errorMessage(err, "Couldn't load showcase events.")));
  }, [showToast]);

  useEffect(() => {
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => {
        setCohorts(d.cohorts);
        if (d.cohorts[0]) setForm((f) => ({ ...f, cohortId: d.cohorts[0]._id }));
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")));
    load();
  }, [showToast, load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/showcase/events", { method: "POST", body: JSON.stringify(form) });
      showToast("Showcase event published.", "success");
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't save the showcase event."));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, published: boolean) {
    setTogglingId(id);
    try {
      await apiFetch(`/api/showcase/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !published }),
      });
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't update the event."));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Showcase Event</h1>
      <p className="text-white/50 text-sm mb-6">
        Publish the event page shown at <code>/showcase</code> — the public, no-login gallery.
      </p>

      <Card className="mb-8">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Cohort</Label>
            <Select value={form.cohortId} onChange={(e) => setForm({ ...form, cohortId: e.target.value })}>
              {cohorts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date &amp; time</Label>
            <Input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
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
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={saving}>
              Publish Event
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e._id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-white/40">{new Date(e.date).toLocaleString("en-GB")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={e.published ? "green" : "gray"}>{e.published ? "published" : "draft"}</Pill>
              <Button
                variant="outline"
                className="text-xs px-3 py-1.5"
                loading={togglingId === e._id}
                onClick={() => togglePublish(e._id, e.published)}
              >
                {e.published ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
