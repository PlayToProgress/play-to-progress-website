"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, StatCard, Pill } from "@/components/ui/Primitives";
import { JourneyCardVisual } from "@/components/journey-card/JourneyCardVisual";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Me {
  _id: string;
  name: string;
  xp: number;
  cohortId?: { name: string; numSessions: number };
}
interface Card_ {
  stampCount: number;
  rewardUnlocked: boolean;
}
interface Badge {
  _id: string;
  label: string;
  awardedAt: string;
}

export default function ParticipantDashboard() {
  const { showToast } = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [card, setCard] = useState<Card_ | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    apiFetch<{ participant: Me }>("/api/participants/me")
      .then((d) => setMe(d.participant))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your profile.")));
    apiFetch<{ card: Card_ }>("/api/journey-card")
      .then((d) => setCard(d.card))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your Journey Card.")));
    apiFetch<{ badges: Badge[] }>("/api/badges")
      .then((d) => setBadges(d.badges))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your badges.")));
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">
        Welcome back{me ? `, ${me.name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-white/50 text-sm mb-8">
        {me?.cohortId?.name ?? "Loading your cohort…"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Stamps" value={`${card?.stampCount ?? 0}/10`} />
        <StatCard label="XP" value={me?.xp ?? 0} />
        <StatCard label="Badges" value={badges.length} />
        <StatCard
          label="Journey"
          value={card?.rewardUnlocked ? "Complete" : "In progress"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="font-display text-xl font-bold mb-4">Your Journey Card</p>
          {card && (
            <JourneyCardVisual
              participantName={me?.name ?? ""}
              stampCount={card.stampCount}
              rewardUnlocked={card.rewardUnlocked}
            />
          )}
          <Link href="/participant/journey-card" className="text-xs text-gold mt-3 inline-block">
            View full card &amp; download →
          </Link>
        </div>

        <div>
          <p className="font-display text-xl font-bold mb-4">Recent badges</p>
          <div className="space-y-2">
            {badges.length === 0 && <p className="text-sm text-white/30">No badges yet — attend your first session!</p>}
            {badges.slice(0, 6).map((b) => (
              <Card key={b._id} className="flex items-center justify-between py-3">
                <span className="text-sm">{b.label}</span>
                <Pill>{new Date(b.awardedAt).toLocaleDateString("en-GB")}</Pill>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
