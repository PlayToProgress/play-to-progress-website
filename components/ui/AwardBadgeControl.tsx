"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface RecognitionBadge {
  type: string;
  label: string;
}

export function AwardBadgeControl({ participantId }: { participantId: string }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<RecognitionBadge[]>([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || catalog.length > 0) return;
    apiFetch<{ badges: RecognitionBadge[] }>("/api/badges/recognition-catalog")
      .then((d) => {
        setCatalog(d.badges);
        if (d.badges[0]) setSelected(d.badges[0].type);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load the badge list.")));
  }, [open, catalog.length, showToast]);

  async function submit() {
    if (!selected) return;
    setSaving(true);
    try {
      await apiFetch("/api/badges/award", {
        method: "POST",
        body: JSON.stringify({ participantId, type: selected }),
      });
      const label = catalog.find((b) => b.type === selected)?.label ?? selected;
      showToast(`${label} awarded.`, "success");
      setOpen(false);
    } catch (err) {
      showToast(errorMessage(err, "Couldn't award this badge."));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        className="text-xs text-white/40 hover:text-gold underline cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Award badge
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        className="w-40 py-1 text-xs"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {catalog.map((b) => (
          <option key={b.type} value={b.type}>
            {b.label}
          </option>
        ))}
      </Select>
      <Button className="text-xs px-2 py-1" loading={saving} disabled={!selected} onClick={submit}>
        Award
      </Button>
      <button className="text-xs text-white/40 cursor-pointer" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </div>
  );
}