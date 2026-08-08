import Image from "next/image";
import clsx from "clsx";

/**
 * The real Profit + Play brand wordmark (client-supplied asset), not a CSS
 * recreation — /public/brand/logo-wordmark.png, cropped tightly from the
 * client's own logo file. Its background is solid near-black (#000), which
 * matches this site's --background (#0A0A0A) closely enough to sit on any
 * dark surface without a visible seam.
 */
const SIZES = {
  sm: { width: 140, height: 29 },
  md: { width: 220, height: 45 },
  lg: { width: 360, height: 73 },
} as const;

export function Wordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { width, height } = SIZES[size];
  return (
    <Image
      src="/brand/logo-wordmark.png"
      alt="Profit + Play — Success"
      width={width}
      height={height}
      priority
      className={clsx("select-none object-contain", className)}
    />
  );
}

export function Monogram({ className }: { className?: string }) {
  return (
    <div className={clsx("relative overflow-hidden rounded-sm", className)}>
      <Image src="/brand/logo-monogram.png" alt="Profit + Play" fill className="object-cover" />
    </div>
  );
}