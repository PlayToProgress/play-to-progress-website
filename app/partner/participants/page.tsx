"use client";

import { useEffect, useState } from "react";
import { Card, Pill } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Participant {
  _id: string;
  name: string;
  age: number;
  cohortId?: { name: string };
}
interface JourneyCard {
  participantId: { _id: string };
  stampCount: number;
  rewardUnlocked: boolean;
}

export default function PartnerParticipantsPage() {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [cards, setCards] = useState<JourneyCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ participants: Participant[] }>("/api/participants"),
      apiFetch<{ cards: JourneyCard[] }>("/api/journey-card"),
    ])
      .then(([p, c]) => {
        setParticipants(p.participants);
        setCards(c.cards);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load your participants.")))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Our Participants</h1>
      <p className="text-white/50 text-sm mb-8">
        Young people enrolled in Play to Progress from your venue.
      </p>

      {loading ? (
        <div className="skeleton-gold rounded-lg h-40" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {participants.map((p) => {
            const card = cards.find((c) => c.participantId?._id === p._id);
            return (
              <Card key={p._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-white/40">
                    Age {p.age} · {p.cohortId?.name}
                  </p>
                </div>
                <Pill tone={card?.rewardUnlocked ? "green" : "gold"}>{card?.stampCount ?? 0}/10 stamps</Pill>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
