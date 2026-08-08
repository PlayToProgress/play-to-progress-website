"use client";

import { useEffect, useState } from "react";
import { Card, Pill } from "@/components/ui/Primitives";
import { JourneyCardVisual } from "@/components/journey-card/JourneyCardVisual";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Participant {
  _id: string;
  name: string;
  cohortId?: { name: string };
}
interface Attendance {
  participantId: string;
  status: "present" | "absent" | "late";
  sessionNumber: number;
}
interface JourneyCard {
  participantId: { _id: string };
  stampCount: number;
  rewardUnlocked: boolean;
}

export default function ParentDashboard() {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [cards, setCards] = useState<JourneyCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ participants: Participant[] }>("/api/participants"),
      apiFetch<{ attendance: Attendance[] }>("/api/attendance"),
      apiFetch<{ cards: JourneyCard[] }>("/api/journey-card"),
    ])
      .then(([p, a, c]) => {
        setParticipants(p.participants);
        setAttendance(a.attendance);
        setCards(c.cards);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load your children's data.")))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">My Children</h1>
      <p className="text-white/50 text-sm mb-8">
        Read-only view of attendance and programme progress.
      </p>

      {loading ? (
        <div className="skeleton-gold rounded-lg h-64" />
      ) : participants.length === 0 ? (
        <p className="text-white/40">No linked participants on your account yet.</p>
      ) : (
        <div className="space-y-10">
          {participants.map((p) => {
            const theirAttendance = attendance.filter((a) => a.participantId === p._id);
            const present = theirAttendance.filter((a) => a.status === "present").length;
            const rate = theirAttendance.length ? Math.round((present / theirAttendance.length) * 100) : 0;
            const card = cards.find((c) => c.participantId?._id === p._id);

            return (
              <div key={p._id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display text-xl font-bold">{p.name}</p>
                    <p className="text-xs text-white/40">{p.cohortId?.name}</p>
                  </div>
                  <Pill tone={rate >= 75 ? "green" : rate >= 50 ? "gold" : "red"}>
                    {rate}% attendance
                  </Pill>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
                      Session record
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {theirAttendance
                        .sort((a, b) => a.sessionNumber - b.sessionNumber)
                        .map((a) => (
                          <Pill
                            key={a.sessionNumber}
                            tone={a.status === "present" ? "green" : a.status === "late" ? "gold" : "red"}
                          >
                            S{a.sessionNumber}: {a.status}
                          </Pill>
                        ))}
                      {theirAttendance.length === 0 && (
                        <p className="text-xs text-white/30">No sessions recorded yet.</p>
                      )}
                    </div>
                  </Card>
                  {card && (
                    <div className="flex justify-center">
                      <JourneyCardVisual
                        participantName={p.name}
                        stampCount={card.stampCount}
                        rewardUnlocked={card.rewardUnlocked}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
