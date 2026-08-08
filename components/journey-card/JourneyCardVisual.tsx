"use client";

import Image from "next/image";
import clsx from "clsx";

interface JourneyCardVisualProps {
  participantName: string;
  stampCount: number;
  totalStamps?: number;
  rewardUnlocked: boolean;
  startDate?: string;
  id?: string; 
}


export function JourneyCardVisual({
  participantName,
  stampCount,
  totalStamps = 10,
  rewardUnlocked,
  startDate,
  id,
}: JourneyCardVisualProps) {
  const stamps = Array.from({ length: totalStamps }, (_, i) => i + 1);

  return (
    <div
      id={id}
      className="w-full max-w-[560px] rounded-2xl overflow-hidden border border-gold/30 bg-black shadow-[0_0_40px_-10px_rgba(201,162,39,0.35)]"
    >
      {/* ===== Front face ===== */}
      <div className="px-6 pt-6 pb-4 border-b border-gold/20">
        <div className="flex items-start justify-between gap-4">
          <div className="shrink-0">
            <div className="relative w-16 h-10">
              <Image src="/brand/logo-monogram.png" alt="P+P" fill className="object-contain" />
            </div>
            <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1 whitespace-nowrap">
              Profit + Play = Success
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-extrabold text-white text-base leading-none">
              PROFIT + PLAY
            </p>
            <p className="font-display italic font-bold text-lg leading-tight gold-text">
              Journey Card
            </p>
            <p className="text-[9px] uppercase tracking-widest text-gold mt-1">
              Build. Create. Enjoy.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-white/60">
            Name: <span className="text-white font-medium">{participantName}</span>
          </span>
          {startDate && (
            <span className="text-white/60">
              Start: <span className="text-white font-medium">{startDate}</span>
            </span>
          )}
        </div>
      </div>

      {/* Front's gold banner tagline */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-[#c9a227] via-[#f5d067] to-[#c9a227] text-center">
        <p className="text-[10px] font-display font-bold uppercase tracking-wide text-black">
          Every step you take today, builds your success tomorrow.
        </p>
      </div>

      {/* ===== Back face ===== */}
      <div className="px-6 py-6 bg-black">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="font-display italic font-bold text-sm leading-tight">
            <span className="text-gold">Your Journey.</span>
            <br />
            <span className="text-white">Your Success.</span>
          </p>
          <p className="text-[10px] text-white/60 text-center max-w-[140px] leading-snug">
            Attend every session.
            <br />
            Collect every stamp.
            <br />
            Unlock your reward.
          </p>
          <p className="text-[9px] uppercase tracking-wide text-right text-white/50 max-w-[110px] leading-snug">
            Show up. Stay committed.
            <br />
            <span className="text-gold font-bold">Earn your reward.</span>
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {stamps.map((n) => {
            const earned = n <= stampCount;
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-display font-bold border-2 transition",
                    earned
                      ? "border-gold bg-gradient-to-br from-[#c9a227] via-[#f5d067] to-[#c9a227] text-black"
                      : "border-gold/30 text-gold/25"
                  )}
                >
                  {earned ? "✓" : "P+P"}
                </div>
                <span className="text-[10px] text-white/40">{n}</span>
              </div>
            );
          })}
          
          <div className="flex flex-col items-center gap-1">
            <div
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center text-center border-2 transition",
                rewardUnlocked
                  ? "border-gold bg-gradient-to-br from-[#c9a227] via-[#f5d067] to-[#c9a227] shadow-[0_0_18px_2px_rgba(245,208,103,0.6)] animate-pulse"
                  : "border-white/10 bg-white/5"
              )}
            >
              <span
                className={clsx(
                  "text-[7px] font-display font-extrabold uppercase leading-tight",
                  rewardUnlocked ? "text-black" : "text-white/20"
                )}
              >
                Reward
              </span>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-4">
          {stampCount}/{totalStamps} stamps collected
        </p>
      </div>

      {/* Back's closing gold banner */}
      <div className="px-6 py-3 bg-gradient-to-r from-[#c9a227] via-[#f5d067] to-[#c9a227] text-center">
        <p className="text-[10px] font-display font-bold uppercase tracking-wide text-black">
          {rewardUnlocked
            ? "★ Journey complete — claim your reward! ★"
            : "★ Complete your journey. Claim your reward. Thank you for being part of Profit + Play. ★"}
        </p>
      </div>
    </div>
  );
}