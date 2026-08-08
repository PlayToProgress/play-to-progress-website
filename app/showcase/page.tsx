"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { images } from "@/lib/images";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  approvedAt?: string;
  creator: { name: string; avatarUrl?: string };
}

interface ShowcaseEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

export default function ShowcasePage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [events, setEvents] = useState<ShowcaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/showcase`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setProjects(data.projects ?? []);
        setEvents(data.events ?? []);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load the showcase.")))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <main className="bg-black text-white min-h-screen">
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/10">
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <Link href="/login">
          <Button variant="outline" className="text-xs px-4 py-2">
            Sign in
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-28 text-center px-6">
        <Image src={images.showcaseCrowd} alt="Community showcase event" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">Digital Showcase</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-4">
            Their <span className="gold-text">work</span>. Their <span className="gold-text">voices</span>.
          </h1>
          <p className="text-white/60">
            A lasting record of what Play to Progress participants have built — games, stories,
            and digital projects, celebrated by the whole community.
          </p>
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          {events.map((e) => (
            <div key={e._id} className="card-surface rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-display text-xl font-bold gold-text">{e.title}</p>
                <p className="text-sm text-white/60 mt-1">{e.description}</p>
                <p className="text-xs text-white/40 mt-2">
                  {new Date(e.date).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })} ·{" "}
                  {e.location}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Gallery */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">Project Gallery</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-gold rounded-lg h-72" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-white/40 py-16">
            No projects have been approved for the public showcase yet check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="card-surface rounded-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={p.imageUrl || images.projectFallback}
                    alt={p.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold">{p.title}</p>
                  <p className="text-sm text-white/50 mt-1 line-clamp-3">{p.description}</p>
                  <p className="text-xs text-gold mt-3 uppercase tracking-wide">
                    by {p.creator.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-white/10 text-center">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Profit + Play, Newham. Under-18 participants only appear
          here with explicit parental/guardian consent.
        </p>
      </footer>
    </main>
  );
}
