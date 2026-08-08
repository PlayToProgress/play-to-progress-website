"use client";

import { useState } from "react";
import { Card, Label, Select, Textarea } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";
import clsx from "clsx";

const MOODS = [
  { value: 1, emoji: "😞", label: "Really low" },
  { value: 2, emoji: "😕", label: "Not great" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export default function CheckInPage() {
  const { showToast } = useToast();
  const [sessionNumber, setSessionNumber] = useState(1);
  const [stage, setStage] = useState<"start" | "end">("start");
  const [mood, setMood] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!mood) return;
    setSaving(true);
    try {
      await apiFetch("/api/checkins", {
        method: "POST",
        body: JSON.stringify({ sessionNumber, stage, mood, comment: comment || undefined }),
      });
      setDone(true);
      setComment("");
      setMood(null);
    } catch (err) {
      showToast(errorMessage(err, "Couldn't submit your check-in."));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Thanks for checking in!</h1>
        <p className="text-white/50 mb-6">Your response has been shared with your coordinator.</p>
        <Button onClick={() => setDone(false)}>Check in again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-3xl font-bold mb-1">How are you feeling?</h1>
      <p className="text-white/50 text-sm mb-8">
        This is just for you and your coordinator — be honest, it helps us support you.
      </p>

      <Card>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Session</Label>
            <Select value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Session {n}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>When</Label>
            <Select value={stage} onChange={(e) => setStage(e.target.value as "start" | "end")}>
              <option value="start">Start of session</option>
              <option value="end">End of session</option>
            </Select>
          </div>
        </div>

        <Label>Mood</Label>
        <div className="flex justify-between mb-4">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={clsx(
                "flex flex-col items-center gap-1 p-2 rounded-md transition cursor-pointer",
                mood === m.value ? "bg-gold/15 border border-gold" : "border border-transparent hover:bg-white/5"
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-white/50">{m.label}</span>
            </button>
          ))}
        </div>

        <Label>Anything you&apos;d like to share? (optional)</Label>
        <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />

        <Button className="mt-4 w-full" disabled={!mood} loading={saving} onClick={submit}>
          Submit Check-In
        </Button>
      </Card>
    </div>
  );
}