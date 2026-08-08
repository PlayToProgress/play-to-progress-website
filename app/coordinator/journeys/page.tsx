"use client";

import { useEffect, useState } from "react";
import { Card, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface JourneyCard {
  _id: string;
  stampCount: number;
  rewardUnlocked: boolean;
  rewardIssued: boolean;
  participantId: { _id: string; name: string };
}

export default function JourneysPage() {
  const { showToast } = useToast();
  const [cards, setCards] = useState<JourneyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch<{ cards: JourneyCard[] }>("/api/journey-card")
      .then((d) => setCards(d.cards))
      .catch((err) => showToast(errorMessage(err, "Couldn't load Journey Cards.")))
      .finally(() => setLoading(false));
  }
  useEffect(load, [showToast]);

  async function issue(participantId: string) {
    setBusyId(participantId);
    try {
      await apiFetch("/api/journey-card/reward", {
        method: "POST",
        body: JSON.stringify({ participantId }),
      });
      showToast("Reward marked as issued.", "success");
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't mark the reward as issued."));
    } finally {
      setBusyId(null);
    }
  }

  const completed = cards.filter((c) => c.rewardUnlocked);
  const inProgress = cards.filter((c) => !c.rewardUnlocked);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Journey Cards</h1>
      <p className="text-white/50 text-sm mb-6">
        Participants who&apos;ve collected all 10 stamps and can have their reward issued.
      </p>

      {loading ? (
        <div className="skeleton-gold rounded-lg h-40" />
      ) : (
        <>
          <p className="text-xs uppercase tracking-wider text-gold mb-3">
            Reward unlocked ({completed.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {completed.length === 0 && <p className="text-white/30 text-sm">No completed journeys yet.</p>}
            {completed.map((c) => (
              <Card key={c._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.participantId.name}</p>
                  <p className="text-xs text-white/40">{c.stampCount}/10 stamps</p>
                </div>
                {c.rewardIssued ? (
                  <Pill tone="green">Reward issued</Pill>
                ) : (
                  <Button
                    className="text-xs px-3 py-1.5"
                    loading={busyId === c.participantId._id}
                    onClick={() => issue(c.participantId._id)}
                  >
                    Mark reward issued
                  </Button>
                )}
              </Card>
            ))}
          </div>

          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">In progress</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgress.map((c) => (
              <Card key={c._id} className="flex items-center justify-between">
                <p>{c.participantId.name}</p>
                <Pill tone="gold">{c.stampCount}/10</Pill>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
