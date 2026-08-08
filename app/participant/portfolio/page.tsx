"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Input, Label, Textarea, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { images } from "@/lib/images";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  isPublic: boolean;
}

export default function PortfolioPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "" });

  function load() {
    setLoading(true);
    apiFetch<{ projects: Project[] }>("/api/projects")
      .then((d) => setProjects(d.projects))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your portfolio.")))
      .finally(() => setLoading(false));
  }
  useEffect(load, [showToast]);

  async function submit(e: React.FormEvent, submitNow: boolean) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ ...form, submit: submitNow }),
      });
      setForm({ title: "", description: "", imageUrl: "" });
      setShowForm(false);
      showToast(submitNow ? "Project submitted for review." : "Saved as draft.", "success");
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't save your project."));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic(p: Project) {
    setTogglingId(p._id);
    try {
      await apiFetch(`/api/projects/${p._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublic: !p.isPublic }),
      });
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't update the showcase setting."));
    } finally {
      setTogglingId(null);
    }
  }

  const statusTone: Record<Project["status"], "gold" | "green" | "red" | "gray"> = {
    draft: "gray",
    submitted: "gold",
    approved: "green",
    rejected: "red",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">My Portfolio</h1>
          <p className="text-white/50 text-sm">Save, describe, and share the work you&apos;re proud of.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ Add Project"}</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form className="space-y-4">
            <div>
              <Label>Project title</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell us what you built and how you made it…"
              />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" loading={saving} onClick={(e) => submit(e, false)}>
                Save as draft
              </Button>
              <Button type="button" loading={saving} onClick={(e) => submit(e, true)}>
                Submit for review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="skeleton-gold rounded-lg h-48" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p._id} className="p-0 overflow-hidden">
              <div className="relative h-40">
                <Image src={p.imageUrl || images.projectFallback} alt={p.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold">{p.title}</p>
                  <Pill tone={statusTone[p.status]}>{p.status}</Pill>
                </div>
                <p className="text-sm text-white/50 mt-2">{p.description}</p>
                {p.status === "approved" && (
                  <label className="flex items-center gap-2 mt-4 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={p.isPublic}
                      disabled={togglingId === p._id}
                      onChange={() => togglePublic(p)}
                    />
                    Show on the public showcase
                  </label>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
