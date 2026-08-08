"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { JourneyCardVisual } from "./JourneyCardVisual";
import { Button } from "@/components/ui/Button";
import { useToast, errorMessage } from "@/components/ui/Toast";

export function JourneyCardDownloadable(props: {
  participantName: string;
  stampCount: number;
  rewardUnlocked: boolean;
  startDate?: string;
}) {
  const { showToast } = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, backgroundColor: "#0a0a0a" });
      const link = document.createElement("a");
      link.download = `${props.participantName.replace(/\s+/g, "-").toLowerCase()}-journey-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't generate the card image."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={ref}>
        <JourneyCardVisual {...props} />
      </div>
      <Button onClick={download} loading={busy} variant="outline">
        Download / Share Card
      </Button>
    </div>
  );
}
