"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Pill } from "@/components/ui/Primitives";
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
  participantId: { name: string; avatarUrl?: string };
}

export default function CoordinatorProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<{ projects: Project[] }>("/api/projects")
      .then((d) => setProjects(d.projects))
      .catch((err) => showToast(errorMessage(err, "Couldn't load project submissions.")))
      .finally(() => setLoading(false));
  }
  useEffect(load, [showToast]);

  async function decide(id: string, decision: "approve" | "reject") {
    setBusyKey(`${id}:${decision}`);
    try {
      await apiFetch(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ decision }) });
      showToast(decision === "approve" ? "Project approved." : "Project rejected.", "success");
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't update this project."));
    } finally {
      setBusyKey(null);
    }
  }

  const pending = projects.filter((p) => p.status === "submitted");
  const decided = projects.filter((p) => p.status !== "submitted" && p.status !== "draft");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Project Submissions</h1>
      <p className="text-white/50 text-sm mb-6">
        Approval here is required before a project can appear on the public showcase (DS-02).
      </p>

      {loading ? (
        <div className="skeleton-gold rounded-lg h-40" />
      ) : (
        <>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Pending review ({pending.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {pending.length === 0 && <p className="text-white/30 text-sm">Nothing waiting for review.</p>}
            {pending.map((p) => (
              <Card key={p._id}>
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden shrink-0">
                    <Image src={p.imageUrl || images.projectFallback} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{p.title}</p>
                    <p className="text-xs text-gold">by {p.participantId?.name}</p>
                    <p className="text-sm text-white/50 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    loading={busyKey === `${p._id}:approve`}
                    disabled={busyKey !== null && busyKey !== `${p._id}:approve`}
                    onClick={() => decide(p._id, "approve")}
                    className="text-xs px-3 py-1.5"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    loading={busyKey === `${p._id}:reject`}
                    disabled={busyKey !== null && busyKey !== `${p._id}:reject`}
                    onClick={() => decide(p._id, "reject")}
                    className="text-xs px-3 py-1.5"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Decided</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decided.map((p) => (
              <Card key={p._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-white/40">by {p.participantId?.name}</p>
                </div>
                <Pill tone={p.status === "approved" ? "green" : "red"}>{p.status}</Pill>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
