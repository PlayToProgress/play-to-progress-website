"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { images } from "@/lib/images";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Me {
  cohortId?: { _id: string };
}
interface Material {
  type: string;
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

const themeImages: Record<string, string> = {
  "Game Design": images.moduleGameDesign,
  Coding: images.moduleCoding,
  Storytelling: images.moduleStorytelling,
  Teamwork: images.moduleTeamwork,
};

export default function ModulesPage() {
  const { showToast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ participant: Me }>("/api/participants/me")
      .then((d) => {
        const cohortId = d.participant.cohortId?._id;
        if (!cohortId) return setLoading(false);
        apiFetch<{ content: Content[] }>(`/api/content?cohortId=${cohortId}`)
          .then((c) => setContent(c.content))
          .catch((err) => showToast(errorMessage(err, "Couldn't load this week's modules.")))
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        showToast(errorMessage(err, "Couldn't load your profile."));
        setLoading(false);
      });
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Weekly Modules</h1>
      <p className="text-white/50 text-sm mb-8">
        Game design, coding, storytelling, teamwork, and digital creativity — one module per week.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-gold rounded-lg h-48" />
          ))}
        </div>
      ) : content.length === 0 ? (
        <p className="text-white/40">Your coordinator hasn&apos;t published this week&apos;s content yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.map((c) => (
            <Card key={c._id} className="p-0 overflow-hidden">
              <div className="relative h-32">
                <Image
                  src={themeImages[c.theme] || images.moduleCoding}
                  alt={c.theme}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <p className="absolute bottom-2 left-4 text-xs uppercase tracking-wider text-gold">
                  Week {c.weekNumber} · {c.theme}
                </p>
              </div>
              <div className="p-5">
                <p className="font-display text-lg font-bold">{c.title}</p>
                <p className="text-sm text-white/50 mt-2">{c.description}</p>
                {c.materials.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {c.materials.map((m, i) => (
                      <li key={i}>
                        <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">
                          {m.title} ({m.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
