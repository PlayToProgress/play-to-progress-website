"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Org {
  name: string;
}
interface Participant {
  _id: string;
}

export default function PartnerDashboard() {
  const { showToast } = useToast();
  const [org, setOrg] = useState<Org | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    apiFetch<{ partnerOrg: Org }>("/api/partner-orgs/me")
      .then((d) => setOrg(d.partnerOrg))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your organisation profile.")));
    apiFetch<{ participants: Participant[] }>("/api/participants")
      .then((d) => setParticipants(d.participants))
      .catch((err) => showToast(errorMessage(err, "Couldn't load your participants.")));
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">{org?.name ?? "Partner"} Dashboard</h1>
      <p className="text-white/50 text-sm mb-8">
        Visibility is limited to participants enrolled from your venue.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Your Participants" value={participants.length} />
      </div>
    </div>
  );
}
