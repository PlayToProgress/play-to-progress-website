"use client";

import { useEffect, useState } from "react";
import { JourneyCardDownloadable } from "@/components/journey-card/JourneyCardDownloadable";
import { Card, Pill } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Me {
  name: string;
}
interface Card_ {
  stampCount: number;
  rewardUnlocked: boolean;
  stamps: { sessionNumber: number }[];
}
interface Badge {
  _id: string;
  label: string;
}

export default function JourneyCardPage() {
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
    <div className="flex flex-col items-center">
      <h1 className="font-display text-3xl font-bold mb-2 self-start">Your Journey Card</h1>
      <p className="text-white/50 text-sm mb-8 self-start">
        Attend every session. Collect every stamp. Unlock your reward.
      </p>
      {card && me && (
        <JourneyCardDownloadable
          participantName={me.name}
          stampCount={card.stampCount}
          rewardUnlocked={card.rewardUnlocked}
        />
      )}
      {card?.rewardUnlocked && (
        <p className="text-sm text-gold mt-6 text-center max-w-sm">
          Journey complete! Show this card (or the downloaded image) to your coordinator at the
          showcase to claim your reward.
        </p>
      )}

      {/* My Profit + Play Promise */}
      <Card className="mt-10 w-full max-w-[560px] text-center border-gold/30">
        <p className="text-[10px] uppercase tracking-widest text-gold mb-3">
          My Profit + Play Promise
        </p>
        <p className="font-display italic text-lg leading-relaxed text-white">
          &ldquo;I chose to believe in my potential. I will build on my strengths, create
          opportunities through my actions and enjoy the journey towards my goal.&rdquo;
        </p>
      </Card>

      {/* Recognition badges earned */}
      {badges.length > 0 && (
        <div className="mt-8 w-full max-w-[560px]">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3 text-center">
            Badges earned
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {badges.map((b) => (
              <Pill key={b._id}>{b.label}</Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}